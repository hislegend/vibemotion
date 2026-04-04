export function useToast() {
  return { toast: (opts: { title?: string; description?: string }) => console.log(opts.title, opts.description) };
}
