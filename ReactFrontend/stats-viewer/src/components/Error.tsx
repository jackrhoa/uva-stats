interface ErrorProps {
  message: string;
}

export const Error = ({ message }: ErrorProps) => {
  return message ? (
    <div className="text-center p-15 text-2xl">{message}</div>
  ) : (
    <div>There was an error loading this page</div>
  );
};
