import { toast } from '@/hooks/use-toast';

export interface ServerResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  details?: string;
  [key: string]: any;
}

export const handleServerResponse = (response: ServerResponse | ApiErrorResponse, showSuccess: boolean = true) => {
  if (response.success) {
    if (showSuccess) {
      toast({
        title: 'Success',
        description: response.message || 'Operation completed successfully',
      });
    }
  } else {
    const errorMessage = response.message || response.error || 'An error occurred';
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive',
    });
  }
};

export const handleApiError = (error: unknown, defaultMessage: string = 'An error occurred') => {
  let message = defaultMessage;

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  toast({
    title: 'Error',
    description: message,
    variant: 'destructive',
  });
};

export const parseErrorResponse = (responseText: string): ApiErrorResponse => {
  try {
    return JSON.parse(responseText);
  } catch {
    return { message: responseText || 'An error occurred' };
  }
};

export const extractServerMessage = (response: any): string => {
  if (typeof response.message === 'string') {
    return response.message;
  }
  if (typeof response.error === 'string') {
    return response.error;
  }
  if (typeof response.details === 'string') {
    return response.details;
  }
  return 'An unknown error occurred';
};
