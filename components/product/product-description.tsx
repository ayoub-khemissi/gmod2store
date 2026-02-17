interface ProductDescriptionProps {
  description: string;
}

export const ProductDescription = ({
  description,
}: ProductDescriptionProps) => {
  return (
    <div className="glass-card p-6">
      <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold mb-4">
        Description
      </h2>
      <div className="prose prose-invert max-w-none text-default-600 whitespace-pre-wrap">
        {description}
      </div>
    </div>
  );
};
