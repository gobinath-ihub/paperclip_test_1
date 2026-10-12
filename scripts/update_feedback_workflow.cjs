const https = require("https");

const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlOGYyZjI2MS0yYjE4LTRkY2MtODUwNS01ZmZmM2M1NDljNTIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNWRkNjRkYTQtMzNiZi00YmY4LTlhNjktYTE3ZGMxYTVjOTExIiwiaWF0IjoxNzg5NjQ0MDQ5LCJleHAiOjE3OTIxNzU0MDB9.byqLvSrEkveEhdj3xzVgfzyfM3usHQ9MwDIDLMVtm80";
const workflowId = "7rh2y5MoWpxozQga";

function request(url, options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve({ statusCode: res.statusCode, data }));
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  console.log("Fetching workflow...", workflowId);
  const getRes = await request(`https://gobzz.app.n8n.cloud/api/v1/workflows/${workflowId}`, {
    headers: { "X-N8N-API-KEY": apiKey }
  });
  const wf = JSON.parse(getRes.data);

  // 1. Update Deterministic Math Check with 2-digit decimal tolerance & fraction parsing
  const dmc = wf.nodes.find(n => n.name === "Deterministic Math Check");
  if (dmc) {
    dmc.parameters.jsCode = `function solveLinearEquation(text) {
  if (!text) return null;
  const clean = String(text).replace(/[\\$]/g, "").replace(/\\s+/g, " ");
  const match = clean.match(/([+-]?\\s*\\d*\\.?\\d*)\\s*([a-zA-Z])\\s*([+-]\\s*\\d+\\.?\\d*)?\\s*=\\s*([+-]?\\s*\\d+\\.?\\d*)/);
  if (!match) return null;

  let rawA = match[1].replace(/\\s+/g, "");
  const variable = match[2];
  let rawB = match[3] ? match[3].replace(/\\s+/g, "") : "0";
  let rawC = match[4].replace(/\\s+/g, "");

  let a = 1;
  if (rawA === "" || rawA === "+") a = 1;
  else if (rawA === "-") a = -1;
  else a = parseFloat(rawA);

  let b = parseFloat(rawB) || 0;
  let c = parseFloat(rawC);

  if (isNaN(a) || isNaN(b) || isNaN(c) || a === 0) return null;

  const solution = (c - b) / a;
  const rounded = Math.round(solution * 10000) / 10000;
  return { variable, a, b, c, solution: rounded };
}

function parseAnswerNumber(val) {
  if (val === null || val === undefined) return null;
  const s = String(val).trim().toLowerCase().replace(/[\\$\\s]/g, "");

  // Fraction support: "1/8", "x=1/8", "-3/4"
  const fracMatch = s.match(/(?:[a-z]=)?([+-]?\\d+)\\/(\\d+)/);
  if (fracMatch) {
    const num = parseFloat(fracMatch[1]);
    const den = parseFloat(fracMatch[2]);
    if (den !== 0) return num / den;
  }

  // Decimal / Integer support: "0.125", "0.12", "x=3"
  const m = s.match(/(?:[a-z]=)?([+-]?\\d+\\.?\\d*)/);
  if (m && m[1]) {
    const num = parseFloat(m[1]);
    if (!isNaN(num)) return num;
  }
  return null;
}

function isSolutionMatch(studentNum, solution) {
  if (studentNum === null || isNaN(studentNum)) return false;

  // 1. Exact or near-exact match
  if (Math.abs(studentNum - solution) < 0.0001) return true;

  // 2. Tolerance for 2 decimal places after the dot (both rounded & truncated)
  // e.g. for 0.125: rounded to 2 digits is 0.13, truncated is 0.12
  const rounded2 = Math.round(solution * 100) / 100;
  const trunc2 = Math.trunc(solution * 100) / 100;
  if (Math.abs(studentNum - rounded2) < 0.001) return true;
  if (Math.abs(studentNum - trunc2) < 0.001) return true;

  // 3. Tolerance within 0.015 for general 2-decimal approximations
  if (Math.abs(studentNum - solution) <= 0.015) return true;

  return false;
}

const normalize = v => String(v ?? "").toLowerCase().replace(/\\s+/g,"").replace(/\\$/g,"");
let expected = normalize($json.expectedAnswer);
let answer = normalize($json.studentAnswer);

let correctByRule = null;
let ruleReason = "unknown";
let solvedExpectedAnswer = "";

// 1. Solve linear equation from question
const eq = solveLinearEquation($json.question);
if (eq) {
  solvedExpectedAnswer = String(eq.solution);
  const studentNum = parseAnswerNumber($json.studentAnswer);

  if (isSolutionMatch(studentNum, eq.solution)) {
    correctByRule = true;
    ruleReason = \`linear_equation_solved_match_\${eq.variable}_equals_\${eq.solution}\`;
  } else if (studentNum !== null) {
    correctByRule = false;
    const wrongSolutionAdd = (eq.c + Math.abs(eq.b)) / eq.a;
    if (eq.b > 0 && Math.abs(studentNum - wrongSolutionAdd) < 0.01) {
      ruleReason = "invalid_inverse_operation";
    } else {
      ruleReason = \`incorrect_value_expected_\${eq.solution}\`;
    }
  }
}

// 2. Direct exact match check if expectedAnswer was provided
if (correctByRule === null && expected) {
  const expNum = parseAnswerNumber(expected);
  const ansNum = parseAnswerNumber(answer);
  if (expNum !== null && ansNum !== null && isSolutionMatch(ansNum, expNum)) {
    correctByRule = true;
    ruleReason = "normalized_number_match";
  } else if (answer === expected) {
    correctByRule = true;
    ruleReason = "normalized_exact_match";
  } else {
    correctByRule = false;
    ruleReason = "exact_match_mismatch";
  }
}

// 3. Fallback check for steps
if (correctByRule === false && eq && Array.isArray($json.steps)) {
  const lastLine = $json.steps[$json.steps.length - 1] || "";
  const stepNum = parseAnswerNumber(lastLine);
  if (isSolutionMatch(stepNum, eq.solution)) {
    correctByRule = true;
    ruleReason = "step_final_line_match";
  }
}

return {
  json: {
    ...$json,
    expectedAnswer: $json.expectedAnswer || solvedExpectedAnswer,
    solvedExpectedAnswer,
    correctByRule,
    ruleReason
  }
};`;
    console.log("Updated Deterministic Math Check with 2-digit decimal tolerance & fraction parser");
  }

  // 2. Update AI Misconception Evaluator
  const ai = wf.nodes.find(n => n.name === "AI Misconception Evaluator");
  if (ai) {
    ai.parameters.messages = {
      values: [
        {
          content: `You are an educational feedback engine for middle and high school mathematics.
Return only valid JSON with keys:
- verdict: "correct" | "incorrect" | "partial"
- misconceptionType: string ("none" if correct, or "invalid_inverse_operation", "arithmetic_error", "sign_error")
- confidence: number (0.0 to 1.0)
- feedbackLevel: number (1 to 4)
- feedback: string (encouraging, constructive)
- retryQuestion: string (follow-up problem)
- successCriteria: string
- teacherFlag: boolean

CRITICAL EVALUATION RULES:
1. TWO-DIGIT DECIMAL TOLERANCE: If a mathematical solution has multiple decimal digits (e.g. 1/8 = 0.125, 1/3 = 0.333...), ALWAYS accept answers given to two decimal digits after the dot (e.g. 0.12 or 0.13 for 0.125; 0.33 for 1/3). Treat both truncated (0.12) and rounded (0.13) as FULLY CORRECT! Never mark a two-decimal answer as an arithmetic error.
2. FRACTION & DECIMAL EQUIVALENCE: Both exact fractions (like 1/8) and decimals (like 0.12, 0.125, 0.13) are valid correct answers.
3. If "Deterministic correctness: true" is provided, the answer is confirmed 100% CORRECT! You MUST set verdict: "correct", misconceptionType: "none", confidence: 0.98, feedbackLevel: 1, and warmly praise the student! NEVER mark a correct answer as incorrect or claim there is an error!
4. If "Deterministic correctness: false", the student's final answer does not match the expected answer. Carefully diagnose their specific mistake from their working steps without giving away the final answer.
5. If "Deterministic correctness: unknown", solve the problem yourself. If the student is correct (including 2-decimal tolerance), verdict MUST be "correct" and misconceptionType "none".`,
          role: "system"
        },
        {
          content: "=Student: {{ $json.studentId }}\nGrade: {{ $json.grade }}\nSubject: {{ $json.subject }}\nTopic: {{ $json.topic }}\nQuestion: {{ $json.question }}\nExpected: {{ $json.expectedAnswer || $json.solvedExpectedAnswer || \"Derive mathematically\" }}\nAnswer: {{ $json.studentAnswer }}\nSteps: {{ JSON.stringify($json.steps) }}\nAttempt: {{ $json.attemptNumber }}\nPrevious misconception: {{ $json.previousMisconception }}\nPrevious feedback: {{ $json.previousFeedback }}\nDeterministic correctness: {{ $json.correctByRule !== null && $json.correctByRule !== undefined ? $json.correctByRule : \"unknown\" }}\nRule reason: {{ $json.ruleReason }}"
        }
      ]
    };
    console.log("Updated AI Misconception Evaluator prompts with 2-digit decimal tolerance");
  }

  // 3. Update Finalize Feedback
  const ff = wf.nodes.find(n => n.name === "Finalize Feedback");
  if (ff) {
    ff.parameters.jsCode = `const s = $("Normalize Attempt").item.json;
const check = $("Deterministic Math Check").item.json;
const raw = $json.content || $json.text || $json.message?.content || $json.output || $json;
let a = raw;
if (typeof raw === 'string') {
  try {
    a = JSON.parse(raw);
  } catch (e) {
    a = {
      verdict: check.correctByRule === true ? 'correct' : 'uncertain',
      misconceptionType: check.correctByRule === true ? 'none' : 'parse_error',
      confidence: check.correctByRule === true ? 0.98 : 0,
      feedbackLevel: 1,
      feedback: check.correctByRule === true ? 'Excellent work! Your answer is correct.' : raw,
      retryQuestion: s.question,
      successCriteria: 'Show each step and retry.',
      teacherFlag: false
    };
  }
}

let isCorrect = (check.correctByRule === true) || (a.verdict === 'correct');
let isDefiniteWrong = (check.correctByRule === false) && (check.ruleReason === 'invalid_inverse_operation');

let verdict = 'incorrect';
if (isCorrect && !isDefiniteWrong) {
  verdict = 'correct';
} else if (a.verdict === 'partial') {
  verdict = 'partial';
} else {
  verdict = 'incorrect';
}

const level = Math.max(1, Math.min(4, Number(a.feedbackLevel || 1)));

let misconceptionType = 'none';
let feedbackText = '';
let retryQuestion = String(a.retryQuestion || '');

if (verdict === 'correct') {
  misconceptionType = 'none';
  if (a.verdict === 'correct' && a.feedback && !/mistake|error|recompute|wrong|fix one step/i.test(a.feedback)) {
    feedbackText = String(a.feedback);
  } else {
    feedbackText = 'Excellent work! Your solution is correct and your algebraic steps are completely sound.';
  }
  if (!retryQuestion || retryQuestion === s.question) {
    retryQuestion = 'Solve 10x + 4 = 54. First subtract 4 from both sides, then divide by 10 to find x.';
  }
} else {
  misconceptionType = String(
    (check.ruleReason === 'invalid_inverse_operation' ? 'invalid_inverse_operation' : a.misconceptionType) || 'arithmetic_error'
  );
  feedbackText = String(a.feedback || 'Review your last step and try again.');
}

const confidence = verdict === 'correct' ? Math.max(0.95, Number(a.confidence || 0.98)) : Math.max(0, Math.min(1, Number(a.confidence || 0.85)));

return [{
  json: {
    attemptId: s.attemptId,
    studentId: s.studentId,
    subject: s.subject,
    grade: s.grade,
    topic: s.topic,
    question: s.question,
    expectedAnswer: check.expectedAnswer || s.expectedAnswer || check.solvedExpectedAnswer || '',
    studentAnswer: s.studentAnswer,
    steps: JSON.stringify(s.steps),
    verdict,
    misconceptionType,
    confidence,
    feedbackLevel: level,
    feedback: feedbackText,
    retryQuestion,
    successCriteria: String(a.successCriteria || 'Show the reasoning for the next attempt.'),
    teacherFlag: Boolean(a.teacherFlag) || (verdict === 'incorrect' && confidence < 0.7),
    recordedAt: new Date().toISOString()
  }
}];`;
    console.log("Updated Finalize Feedback code");
  }

  const updateBody = JSON.stringify({
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings
  });

  const putRes = await request(`https://gobzz.app.n8n.cloud/api/v1/workflows/${workflowId}`, {
    method: "PUT",
    headers: {
      "X-N8N-API-KEY": apiKey,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(updateBody)
    }
  }, updateBody);

  console.log("PUT Workflow response code:", putRes.statusCode);
  if (putRes.statusCode !== 200) {
    console.error("PUT error:", putRes.data);
  }

  // Activate workflow
  const actRes = await request(`https://gobzz.app.n8n.cloud/api/v1/workflows/${workflowId}/activate`, {
    method: "POST",
    headers: { "X-N8N-API-KEY": apiKey }
  });
  console.log("Activate response code:", actRes.statusCode);
}

main().catch(console.error);
