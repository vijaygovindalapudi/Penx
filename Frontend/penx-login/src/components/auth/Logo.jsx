import BrandLogo from "../common/BrandLogo";

export default function Logo({
  size = 40,
  withWordmark = true,
  className = "",
}) {
  return (
    <BrandLogo
      size={size}
      variant={withWordmark ? "full" : "symbol"}
      className={className}
    />
  );
}