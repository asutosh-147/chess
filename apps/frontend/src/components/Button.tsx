type Props = {
  onClick: () => void;
  children: React.ReactNode;
  fontWeight: string;
};
const Button = ({ onClick, children, fontWeight }: Props) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 md:p-3 bg-tan-300 text-black shadow-2xl hover:bg-tan-500 transition-colors hover:shadow-md rounded-lg text-2xl font-${fontWeight} flex justify-center items-center gap-3`}
    >
      {children}
    </button>
  );
};

export default Button;
