interface LoginProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sort: string }>;
}

const Login: React.FC<LoginProps> = async ({
  params,
  searchParams,
}: LoginProps) => {
  const { id } = await params;
  const { sort } = await searchParams;
  return (
    <div>
      <div>{id}</div>
      <div>{sort}</div>
    </div>
  );
};

export default Login;
