import { useMutation, useQueryClient, UseMutationOptions, UseMutationResult } from "@tanstack/react-query";

type UseGenericMutationProps<TData, TError, TVariables, TContext> = {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey?: unknown[];
  onMutate?: (variables: TVariables) => Promise<TContext> | TContext;
  onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void;
  onError?: (error: TError, variables: TVariables, context: TContext | undefined) => void;
  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    variables: TVariables,
    context: TContext | undefined
  ) => void;
};

export function useGenericMutation<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  props: UseGenericMutationProps<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> {
  const queryClient = useQueryClient();

return useMutation<TData, TError, TVariables, TContext>({
  mutationFn: props.mutationFn,
  onMutate: async (variables) => {
    if (props.onMutate) {
      return await props.onMutate(variables);
    }
  },
  onSuccess: (data, variables, context) => {
    if (props.queryKey) {
      queryClient.invalidateQueries({ queryKey: props.queryKey });
    }
    if (props.onSuccess) {
      props.onSuccess(data, variables, context);
    }
  },
  onError: (error, variables, context) => {
    if (props.onError) {
      props.onError(error, variables, context);
    }
  },
  onSettled: (data, error, variables, context) => {
    if (props.onSettled) {
      props.onSettled(data, error ?? null, variables, context);
    }
  },
});

}
