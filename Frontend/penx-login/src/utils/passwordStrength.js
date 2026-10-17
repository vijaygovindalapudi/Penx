export function calculatePasswordStrength(password) {
  let score = 0;

  if (!password) {
    return {
      score: 0,
      label: "Very Weak",
      color: "#ef4444",
    };
  }

  // Length
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;

  // Uppercase
  if (/[A-Z]/.test(password)) score += 20;

  // Lowercase
  if (/[a-z]/.test(password)) score += 20;

  // Number
  if (/[0-9]/.test(password)) score += 15;

  // Special Character
  if (/[^A-Za-z0-9]/.test(password)) score += 15;

  let label = "Very Weak";
  let color = "#ef4444";

  if (score >= 90) {
    label = "Very Strong";
    color = "#22c55e";
  } else if (score >= 70) {
    label = "Strong";
    color = "#84cc16";
  } else if (score >= 50) {
    label = "Medium";
    color = "#eab308";
  } else if (score >= 30) {
    label = "Weak";
    color = "#f97316";
  }

  return {
    score,
    label,
    color,
  };
}