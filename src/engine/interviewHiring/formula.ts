type Token = { type: "num"; value: number } | { type: "id"; value: string } | { type: "op"; value: string };

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let j = i + 1;
      while (j < expr.length && /[0-9.]/.test(expr[j])) j += 1;
      tokens.push({ type: "num", value: Number(expr.slice(i, j)) });
      i = j;
      continue;
    }
    if (/[a-zA-Z_]/.test(ch)) {
      let j = i + 1;
      while (j < expr.length && /[a-zA-Z_]/.test(expr[j])) j += 1;
      tokens.push({ type: "id", value: expr.slice(i, j) });
      i = j;
      continue;
    }
    if ("+-*/()".includes(ch)) {
      tokens.push({ type: "op", value: ch });
      i += 1;
      continue;
    }
    throw new Error(`Unsupported token '${ch}' in formula.`);
  }
  return tokens;
}

export function evaluateFormula(expr: string, vars: Record<string, number>): number {
  const tokens = tokenize(expr);
  let index = 0;

  const parsePrimary = (): number => {
    const token = tokens[index];
    if (!token) throw new Error("Unexpected end of formula.");

    if (token.type === "num") {
      index += 1;
      return token.value;
    }

    if (token.type === "id") {
      index += 1;
      if (!(token.value in vars)) {
        throw new Error(`Unknown variable '${token.value}' in formula.`);
      }
      return vars[token.value];
    }

    if (token.type === "op" && token.value === "(") {
      index += 1;
      const value = parseExpression();
      const close = tokens[index];
      if (!close || close.type !== "op" || close.value !== ")") {
        throw new Error("Missing closing parenthesis in formula.");
      }
      index += 1;
      return value;
    }

    if (token.type === "op" && token.value === "-") {
      index += 1;
      return -parsePrimary();
    }

    throw new Error("Invalid formula syntax.");
  };

  const parseTerm = (): number => {
    let value = parsePrimary();
    while (index < tokens.length) {
      const token = tokens[index];
      if (token.type !== "op" || !"*/".includes(token.value)) break;
      index += 1;
      const rhs = parsePrimary();
      value = token.value === "*" ? value * rhs : value / rhs;
    }
    return value;
  };

  const parseExpression = (): number => {
    let value = parseTerm();
    while (index < tokens.length) {
      const token = tokens[index];
      if (token.type !== "op" || !"+-".includes(token.value)) break;
      index += 1;
      const rhs = parseTerm();
      value = token.value === "+" ? value + rhs : value - rhs;
    }
    return value;
  };

  const value = parseExpression();
  if (index !== tokens.length) {
    throw new Error("Unexpected trailing expression in formula.");
  }
  return value;
}
