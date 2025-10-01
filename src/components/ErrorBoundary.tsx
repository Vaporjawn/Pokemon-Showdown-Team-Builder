import React from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Snackbar,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  BugReport as BugIcon,
} from '@mui/icons-material';
import { analytics } from '../services/analytics';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId?: string;
  copied: boolean;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, copied: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // Track error in analytics
    analytics.trackError({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      sessionId: (analytics as any).sessionId,
      additional: {
        errorId: this.state.errorId,
        retryCount: this.retryCount,
        props: this.sanitizeProps(this.props),
      },
    });

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Trigger global error boundary callback if available
    const globalCallback = (window as any).__POKEMON_HUB_ERROR_BOUNDARY__;
    globalCallback?.(error, errorInfo);
  }

  private sanitizeProps(props: any): Record<string, any> {
    try {
      return JSON.parse(JSON.stringify(props, (key, value) => {
        if (typeof value === 'function') return '[Function]';
        if (value instanceof Error) return value.message;
        return value;
      }));
    } catch {
      return { message: 'Unable to serialize props' };
    }
  }

  handleReset = () => {
    this.retryCount++;

    analytics.trackEvent({
      action: 'error_boundary_retry',
      category: 'errors',
      label: this.state.errorId,
      value: this.retryCount,
    });

    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
      copied: false,
    });
  };

  handleCopyError = async () => {
    if (!this.state.error) return;

    const errorDetails = {
      message: this.state.error.message,
      stack: this.state.error.stack,
      componentStack: this.state.errorInfo?.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);

      analytics.trackEvent({
        action: 'error_details_copied',
        category: 'errors',
        label: this.state.errorId,
      });
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  handleReportBug = () => {
    const issueTitle = encodeURIComponent(`Bug Report: ${this.state.error?.message || 'Unknown Error'}`);
    const issueBody = encodeURIComponent(`
**Error Details:**
- Error ID: ${this.state.errorId}
- Message: ${this.state.error?.message}
- URL: ${window.location.href}
- Timestamp: ${new Date().toISOString()}

**Steps to Reproduce:**
1.
2.
3.

**Expected Behavior:**


**Additional Context:**

    `);

    const githubUrl = `https://github.com/Vaporjawn/Pokemon-Showdown-Team-Builder/issues/new?title=${issueTitle}&body=${issueBody}&labels=bug`;
    window.open(githubUrl, '_blank');

    analytics.trackEvent({
      action: 'bug_report_opened',
      category: 'errors',
      label: this.state.errorId,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.handleReset} />;
      }

      const canRetry = this.retryCount < this.maxRetries;

      return (
        <>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              p: 3,
              bgcolor: 'background.default',
            }}
          >
            <Alert
              severity="error"
              sx={{
                maxWidth: 800,
                mb: 3,
                '& .MuiAlert-message': { width: '100%' },
              }}
            >
              <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BugIcon /> Something went wrong
                {this.state.errorId && (
                  <Chip
                    label={`ID: ${this.state.errorId}`}
                    size="small"
                    variant="outlined"
                    sx={{ ml: 'auto' }}
                  />
                )}
              </AlertTitle>

              <Typography variant="body2" sx={{ mb: 2 }}>
                The application encountered an unexpected error.
                {canRetry ? 'You can try again or refresh the page.' : 'Please refresh the page or report this issue.'}
              </Typography>

              {this.state.error && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Error:</strong> {this.state.error.message}
                  </Typography>

                  {this.state.error.stack && (
                    <Accordion sx={{ mt: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body2">Technical Details</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            whiteSpace: 'pre-wrap',
                            overflow: 'auto',
                            maxHeight: 300,
                            bgcolor: 'grey.100',
                            p: 2,
                            borderRadius: 1,
                          }}
                        >
                          {this.state.error.stack}
                        </Typography>

                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={this.handleCopyError}
                            title="Copy error details"
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                          <Typography variant="caption" sx={{ alignSelf: 'center' }}>
                            Copy technical details
                          </Typography>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </Box>
              )}
            </Alert>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              {canRetry && (
                <Button
                  variant="contained"
                  onClick={this.handleReset}
                  startIcon={<RefreshIcon />}
                >
                  Try Again ({this.maxRetries - this.retryCount} left)
                </Button>
              )}

              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
                startIcon={<RefreshIcon />}
              >
                Refresh Page
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                onClick={this.handleReportBug}
                startIcon={<BugIcon />}
              >
                Report Bug
              </Button>
            </Box>

            {!canRetry && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2, textAlign: 'center' }}
              >
                Maximum retry attempts reached. Please refresh the page or report this issue.
              </Typography>
            )}
          </Box>

          <Snackbar
            open={this.state.copied}
            autoHideDuration={2000}
            onClose={() => this.setState({ copied: false })}
            message="Error details copied to clipboard"
          />
        </>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
