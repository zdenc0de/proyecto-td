/**
 * Parser seguro para funciones matemáticas personalizadas
 * Permite evaluar expresiones como: sin(t), cos(2*t), sin(t) + cos(t), etc.
 */

// Funciones matemáticas permitidas
const ALLOWED_FUNCTIONS = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  abs: Math.abs,
  sqrt: Math.sqrt,
  exp: Math.exp,
  log: Math.log,
  pow: Math.pow,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
};

// Constantes permitidas
const ALLOWED_CONSTANTS = {
  PI: Math.PI,
  E: Math.E,
  pi: Math.PI,
  e: Math.E,
};

/**
 * Tokeniza una expresión matemática
 */
const tokenize = (expr) => {
  const tokens = [];
  let i = 0;

  while (i < expr.length) {
    const char = expr[i];

    // Ignorar espacios
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Números (incluyendo decimales)
    if (/[0-9.]/.test(char)) {
      let num = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        num += expr[i];
        i++;
      }
      tokens.push({ type: 'number', value: parseFloat(num) });
      continue;
    }

    // Identificadores (funciones, constantes, variable t)
    if (/[a-zA-Z_]/.test(char)) {
      let id = '';
      while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i])) {
        id += expr[i];
        i++;
      }
      tokens.push({ type: 'identifier', value: id });
      continue;
    }

    // Operadores y paréntesis
    if ('+-*/^()'.includes(char)) {
      tokens.push({ type: 'operator', value: char });
      i++;
      continue;
    }

    // Carácter no reconocido
    throw new Error(`Carácter no válido: ${char}`);
  }

  return tokens;
};

/**
 * Parser de expresiones con precedencia de operadores
 */
class ExpressionParser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  peek() {
    return this.tokens[this.pos];
  }

  consume() {
    return this.tokens[this.pos++];
  }

  parse() {
    const result = this.parseAddSub();
    if (this.pos < this.tokens.length) {
      throw new Error('Expresión inválida');
    }
    return result;
  }

  // Suma y resta (menor precedencia)
  parseAddSub() {
    let left = this.parseMulDiv();

    while (this.peek() && (this.peek().value === '+' || this.peek().value === '-')) {
      const op = this.consume().value;
      const right = this.parseMulDiv();
      if (op === '+') {
        left = { type: 'binary', op: '+', left, right };
      } else {
        left = { type: 'binary', op: '-', left, right };
      }
    }

    return left;
  }

  // Multiplicación y división
  parseMulDiv() {
    let left = this.parsePower();

    while (this.peek() && (this.peek().value === '*' || this.peek().value === '/')) {
      const op = this.consume().value;
      const right = this.parsePower();
      left = { type: 'binary', op, left, right };
    }

    return left;
  }

  // Potencia (mayor precedencia)
  parsePower() {
    let left = this.parseUnary();

    while (this.peek() && this.peek().value === '^') {
      this.consume();
      const right = this.parseUnary();
      left = { type: 'binary', op: '^', left, right };
    }

    return left;
  }

  // Unario (negación)
  parseUnary() {
    if (this.peek() && this.peek().value === '-') {
      this.consume();
      const operand = this.parseUnary();
      return { type: 'unary', op: '-', operand };
    }
    if (this.peek() && this.peek().value === '+') {
      this.consume();
      return this.parseUnary();
    }
    return this.parsePrimary();
  }

  // Primarios: números, variables, funciones, paréntesis
  parsePrimary() {
    const token = this.peek();

    if (!token) {
      throw new Error('Expresión incompleta');
    }

    // Número
    if (token.type === 'number') {
      this.consume();
      return { type: 'number', value: token.value };
    }

    // Identificador (variable, constante o función)
    if (token.type === 'identifier') {
      this.consume();
      const name = token.value;

      // ¿Es una función?
      if (this.peek() && this.peek().value === '(') {
        if (!ALLOWED_FUNCTIONS[name]) {
          throw new Error(`Función no permitida: ${name}`);
        }
        this.consume(); // (
        const arg = this.parseAddSub();
        if (!this.peek() || this.peek().value !== ')') {
          throw new Error('Falta paréntesis de cierre');
        }
        this.consume(); // )
        return { type: 'function', name, arg };
      }

      // ¿Es una constante?
      if (ALLOWED_CONSTANTS[name] !== undefined) {
        return { type: 'constant', name };
      }

      // ¿Es la variable t?
      if (name === 't') {
        return { type: 'variable', name: 't' };
      }

      throw new Error(`Identificador no reconocido: ${name}`);
    }

    // Paréntesis
    if (token.value === '(') {
      this.consume();
      const expr = this.parseAddSub();
      if (!this.peek() || this.peek().value !== ')') {
        throw new Error('Falta paréntesis de cierre');
      }
      this.consume();
      return expr;
    }

    throw new Error(`Token inesperado: ${token.value}`);
  }
}

/**
 * Evalúa un AST con un valor específico de t
 */
const evaluateAST = (ast, t) => {
  switch (ast.type) {
    case 'number':
      return ast.value;

    case 'variable':
      if (ast.name === 't') return t;
      throw new Error(`Variable desconocida: ${ast.name}`);

    case 'constant':
      return ALLOWED_CONSTANTS[ast.name];

    case 'function':
      const arg = evaluateAST(ast.arg, t);
      return ALLOWED_FUNCTIONS[ast.name](arg);

    case 'unary':
      if (ast.op === '-') return -evaluateAST(ast.operand, t);
      throw new Error(`Operador unario desconocido: ${ast.op}`);

    case 'binary': {
      const left = evaluateAST(ast.left, t);
      const right = evaluateAST(ast.right, t);
      switch (ast.op) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/': return right !== 0 ? left / right : 0;
        case '^': return Math.pow(left, right);
        default: throw new Error(`Operador desconocido: ${ast.op}`);
      }
    }

    default:
      throw new Error(`Tipo de nodo desconocido: ${ast.type}`);
  }
};

/**
 * Compila una expresión matemática a una función evaluable
 * @param {string} expression - La expresión matemática (ej: "sin(2*PI*t)")
 * @returns {Function} Una función que toma t y retorna el valor
 */
export const compileFunction = (expression) => {
  try {
    const tokens = tokenize(expression);
    const parser = new ExpressionParser(tokens);
    const ast = parser.parse();

    return (t) => {
      try {
        return evaluateAST(ast, t);
      } catch {
        return 0;
      }
    };
  } catch (error) {
    throw new Error(`Error al parsear la expresión: ${error.message}`);
  }
};

/**
 * Valida si una expresión es válida
 * @param {string} expression - La expresión a validar
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateExpression = (expression) => {
  if (!expression || expression.trim() === '') {
    return { valid: false, error: 'La expresión está vacía' };
  }

  try {
    const tokens = tokenize(expression);
    const parser = new ExpressionParser(tokens);
    parser.parse();
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

/**
 * Funciones predefinidas - Solo Seno y Coseno
 */
export const PRESET_FUNCTIONS = [
  { name: 'Seno', expression: 'sin(t)', description: 'sin(t)' },
  { name: 'Coseno', expression: 'cos(t)', description: 'cos(t)' },
];
