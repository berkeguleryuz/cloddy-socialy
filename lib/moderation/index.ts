/**
 * Content Moderation Service
 * Provides keyword filtering, spam detection, AI moderation, and auto-flagging
 *
 * Features:
 * - Regex-based pattern matching for fast local checks
 * - OpenAI Moderation API integration for AI-powered analysis
 * - Combined scoring system for accurate content classification
 * - Configurable thresholds and severity levels
 */

// Severity levels for moderation actions
export type ModerationSeverity = 'low' | 'medium' | 'high' | 'critical'

// OpenAI Moderation API response types
interface OpenAIModerationCategory {
  sexual: boolean
  hate: boolean
  harassment: boolean
  'self-harm': boolean
  'sexual/minors': boolean
  'hate/threatening': boolean
  'violence/graphic': boolean
  violence: boolean
  'harassment/threatening': boolean
  'self-harm/intent': boolean
  'self-harm/instructions': boolean
}

interface OpenAIModerationScores {
  sexual: number
  hate: number
  harassment: number
  'self-harm': number
  'sexual/minors': number
  'hate/threatening': number
  'violence/graphic': number
  violence: number
  'harassment/threatening': number
  'self-harm/intent': number
  'self-harm/instructions': number
}

interface OpenAIModerationResult {
  id: string
  model: string
  results: Array<{
    flagged: boolean
    categories: OpenAIModerationCategory
    category_scores: OpenAIModerationScores
  }>
}

// AI moderation thresholds (configurable)
const AI_THRESHOLDS = {
  sexual: 0.7,
  hate: 0.5,
  harassment: 0.6,
  'self-harm': 0.5,
  'sexual/minors': 0.3,
  'hate/threatening': 0.4,
  'violence/graphic': 0.6,
  violence: 0.7,
  'harassment/threatening': 0.5,
  'self-harm/intent': 0.4,
  'self-harm/instructions': 0.4,
}

export interface ModerationResult {
  isClean: boolean
  flags: ModerationFlag[]
  severity: ModerationSeverity
  shouldBlock: boolean
  shouldFlag: boolean
  cleanedContent?: string
}

export interface ModerationFlag {
  type: 'profanity' | 'spam' | 'harassment' | 'hate_speech' | 'adult' | 'violence' | 'scam' | 'personal_info'
  severity: ModerationSeverity
  matches: string[]
  context?: string
}

// Banned words/patterns (can be extended or loaded from database)
const PROFANITY_PATTERNS = [
  // Common profanity - using patterns that won't match normal words
  /\bf+u+c+k+\b/gi,
  /\bs+h+i+t+\b/gi,
  /\ba+s+s+h+o+l+e+\b/gi,
  /\bb+i+t+c+h+\b/gi,
  /\bd+a+m+n+\b/gi,
  /\bc+u+n+t+\b/gi,
]

const HATE_SPEECH_PATTERNS = [
  // Slurs and hate speech patterns
  /\bn+[i1]+g+[g4]+[e3a]+r*\b/gi,
  /\bf+[a4]+g+[o0]+t*\b/gi,
  /\br+[e3]+t+[a4]+r+d+\b/gi,
]

const HARASSMENT_PATTERNS = [
  /\bkill\s+(your)?self\b/gi,
  /\bgo\s+die\b/gi,
  /\bkys\b/gi,
  /\byou\s+(should|deserve\s+to)\s+die\b/gi,
]

const SCAM_PATTERNS = [
  /\bfree\s+crypto\b/gi,
  /\bdouble\s+your\s+(money|crypto|bitcoin|eth)\b/gi,
  /\bsend\s+me\s+\d+\s*(btc|eth|sol)\b/gi,
  /\binvest\s+now\b/gi,
  /\bguaranteed\s+(returns?|profit)\b/gi,
  /\bclick\s+(here|this\s+link)\b/gi,
  /\bclaim\s+your\s+(free|reward)\b/gi,
]

const PERSONAL_INFO_PATTERNS = [
  // Phone numbers
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  // Email-like patterns
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
  // Social security numbers
  /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g,
  // Credit card numbers
  /\b\d{4}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b/g,
]

// Spam detection patterns
const SPAM_PATTERNS = [
  // Repeated characters
  /(.)\1{5,}/g,
  // All caps (more than 70% of content)
  // Excessive punctuation
  /[!?]{4,}/g,
  // Repeated words
  /\b(\w+)\s+\1\s+\1\b/gi,
]

// URL patterns for link spam detection
const URL_PATTERN = /https?:\/\/[^\s]+/gi

/**
 * Check content against moderation rules
 */
export function moderateContent(content: string): ModerationResult {
  const flags: ModerationFlag[] = []
  let severity: ModerationSeverity = 'low'
  const normalizedContent = content.toLowerCase()

  // Check profanity
  const profanityMatches: string[] = []
  for (const pattern of PROFANITY_PATTERNS) {
    const matches = content.match(pattern)
    if (matches) {
      profanityMatches.push(...matches)
    }
  }
  if (profanityMatches.length > 0) {
    flags.push({
      type: 'profanity',
      severity: profanityMatches.length > 3 ? 'medium' : 'low',
      matches: profanityMatches,
    })
    severity = 'low'
  }

  // Check hate speech (critical)
  const hateSpeechMatches: string[] = []
  for (const pattern of HATE_SPEECH_PATTERNS) {
    const matches = content.match(pattern)
    if (matches) {
      hateSpeechMatches.push(...matches)
    }
  }
  if (hateSpeechMatches.length > 0) {
    flags.push({
      type: 'hate_speech',
      severity: 'critical',
      matches: hateSpeechMatches,
    })
    severity = 'critical'
  }

  // Check harassment (high)
  const harassmentMatches: string[] = []
  for (const pattern of HARASSMENT_PATTERNS) {
    const matches = content.match(pattern)
    if (matches) {
      harassmentMatches.push(...matches)
    }
  }
  if (harassmentMatches.length > 0) {
    flags.push({
      type: 'harassment',
      severity: 'high',
      matches: harassmentMatches,
    })
    if (severity !== 'critical') severity = 'high'
  }

  // Check scam patterns (high)
  const scamMatches: string[] = []
  for (const pattern of SCAM_PATTERNS) {
    const matches = content.match(pattern)
    if (matches) {
      scamMatches.push(...matches)
    }
  }
  if (scamMatches.length > 0) {
    flags.push({
      type: 'scam',
      severity: 'high',
      matches: scamMatches,
    })
    if (severity !== 'critical') severity = 'high'
  }

  // Check personal info (medium)
  const personalInfoMatches: string[] = []
  for (const pattern of PERSONAL_INFO_PATTERNS) {
    const matches = content.match(pattern)
    if (matches) {
      personalInfoMatches.push(...matches)
    }
  }
  if (personalInfoMatches.length > 0) {
    flags.push({
      type: 'personal_info',
      severity: 'medium',
      matches: personalInfoMatches,
      context: 'Potential personal information detected',
    })
    if (severity === 'low') severity = 'medium'
  }

  // Check spam patterns
  const isSpam = checkForSpam(content)
  if (isSpam.isSpam) {
    flags.push({
      type: 'spam',
      severity: 'medium',
      matches: isSpam.reasons,
    })
    if (severity === 'low') severity = 'medium'
  }

  // Determine actions
  const shouldBlock = severity === 'critical' || hateSpeechMatches.length > 0
  const shouldFlag = flags.length > 0

  return {
    isClean: flags.length === 0,
    flags,
    severity,
    shouldBlock,
    shouldFlag,
    cleanedContent: shouldBlock ? undefined : censorContent(content, flags),
  }
}

/**
 * Check for spam-like behavior
 */
function checkForSpam(content: string): { isSpam: boolean; reasons: string[] } {
  const reasons: string[] = []

  // Check for repeated characters
  if (/(.)\1{5,}/.test(content)) {
    reasons.push('Repeated characters')
  }

  // Check for excessive caps (more than 70% uppercase)
  const letters = content.replace(/[^a-zA-Z]/g, '')
  const uppercase = letters.replace(/[^A-Z]/g, '')
  if (letters.length > 10 && uppercase.length / letters.length > 0.7) {
    reasons.push('Excessive capitals')
  }

  // Check for excessive punctuation
  if (/[!?]{4,}/.test(content)) {
    reasons.push('Excessive punctuation')
  }

  // Check for too many URLs (potential link spam)
  const urls = content.match(URL_PATTERN)
  if (urls && urls.length > 3) {
    reasons.push('Too many links')
  }

  // Check for repeated words
  if (/\b(\w+)\s+\1\s+\1\b/i.test(content)) {
    reasons.push('Repeated words')
  }

  return {
    isSpam: reasons.length > 0,
    reasons,
  }
}

/**
 * Censor flagged content
 */
function censorContent(content: string, flags: ModerationFlag[]): string {
  let censored = content

  for (const flag of flags) {
    if (flag.type === 'profanity' || flag.type === 'hate_speech') {
      for (const match of flag.matches) {
        const replacement = match[0] + '*'.repeat(match.length - 2) + match[match.length - 1]
        censored = censored.replace(new RegExp(escapeRegex(match), 'gi'), replacement)
      }
    }
  }

  return censored
}

/**
 * Escape special regex characters
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Quick check if content is likely clean (for performance)
 */
export function quickCheck(content: string): boolean {
  const lowerContent = content.toLowerCase()

  // Quick checks for obvious violations
  for (const pattern of [...HATE_SPEECH_PATTERNS, ...HARASSMENT_PATTERNS]) {
    if (pattern.test(lowerContent)) {
      return false
    }
  }

  return true
}

/**
 * Get moderation statistics for admin dashboard
 */
export function getModerationStats(flags: ModerationFlag[]): Record<string, number> {
  const stats: Record<string, number> = {
    total: flags.length,
    profanity: 0,
    spam: 0,
    harassment: 0,
    hate_speech: 0,
    adult: 0,
    violence: 0,
    scam: 0,
    personal_info: 0,
  }

  for (const flag of flags) {
    stats[flag.type]++
  }

  return stats
}

/**
 * AI-powered content moderation using OpenAI Moderation API
 * Falls back to regex-only if API is unavailable
 */
export async function moderateContentAI(content: string): Promise<ModerationResult> {
  // First, run local regex checks (fast)
  const localResult = moderateContent(content)

  // If content is clearly blocked by regex, no need for AI check
  if (localResult.shouldBlock) {
    return localResult
  }

  // Try AI moderation if API key is available
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    // No API key, return regex-only result
    return localResult
  }

  try {
    const aiResult = await callOpenAIModeration(content, apiKey)
    return combineResults(localResult, aiResult)
  } catch (error) {
    console.error('AI moderation failed, falling back to regex:', error)
    return localResult
  }
}

/**
 * Call OpenAI Moderation API
 */
async function callOpenAIModeration(
  content: string,
  apiKey: string
): Promise<OpenAIModerationResult | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ input: content }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('OpenAI Moderation API call failed:', error)
    return null
  }
}

/**
 * Combine regex and AI moderation results
 */
function combineResults(
  localResult: ModerationResult,
  aiResult: OpenAIModerationResult | null
): ModerationResult {
  if (!aiResult || !aiResult.results?.[0]) {
    return localResult
  }

  const aiData = aiResult.results[0]
  const flags = [...localResult.flags]
  let severity = localResult.severity

  // Map OpenAI categories to our flag types
  const categoryMapping: Record<string, ModerationFlag['type']> = {
    sexual: 'adult',
    'sexual/minors': 'adult',
    hate: 'hate_speech',
    'hate/threatening': 'hate_speech',
    harassment: 'harassment',
    'harassment/threatening': 'harassment',
    'self-harm': 'harassment',
    'self-harm/intent': 'harassment',
    'self-harm/instructions': 'harassment',
    violence: 'violence',
    'violence/graphic': 'violence',
  }

  // Check each category against thresholds
  for (const [category, score] of Object.entries(aiData.category_scores)) {
    const threshold = AI_THRESHOLDS[category as keyof typeof AI_THRESHOLDS]
    if (score >= threshold) {
      const flagType = categoryMapping[category] || 'harassment'

      // Check if we already have this flag type
      const existingFlag = flags.find((f) => f.type === flagType)
      if (!existingFlag) {
        const categorySeverity = getCategorySeverity(category, score)
        flags.push({
          type: flagType,
          severity: categorySeverity,
          matches: [`AI detected: ${category} (${(score * 100).toFixed(1)}%)`],
          context: `OpenAI Moderation: ${category}`,
        })

        // Update overall severity
        if (categorySeverity === 'critical') severity = 'critical'
        else if (categorySeverity === 'high' && severity !== 'critical') severity = 'high'
        else if (categorySeverity === 'medium' && severity === 'low') severity = 'medium'
      }
    }
  }

  // Determine actions based on combined results
  const shouldBlock =
    severity === 'critical' ||
    aiData.flagged ||
    aiData.categories['sexual/minors'] ||
    aiData.categories['hate/threatening']

  const shouldFlag = flags.length > 0 || aiData.flagged

  return {
    isClean: !shouldFlag,
    flags,
    severity,
    shouldBlock,
    shouldFlag,
    cleanedContent: shouldBlock ? undefined : censorContent(localResult.cleanedContent || '', flags),
  }
}

/**
 * Determine severity based on AI category and score
 */
function getCategorySeverity(category: string, score: number): ModerationSeverity {
  // Critical categories
  if (
    category === 'sexual/minors' ||
    category === 'hate/threatening' ||
    category === 'self-harm/intent'
  ) {
    return 'critical'
  }

  // High severity based on score
  if (score > 0.9) return 'critical'
  if (score > 0.7) return 'high'
  if (score > 0.5) return 'medium'
  return 'low'
}

/**
 * Batch moderate multiple pieces of content
 */
export async function moderateContentBatch(
  contents: string[]
): Promise<ModerationResult[]> {
  const results = await Promise.all(
    contents.map((content) => moderateContentAI(content))
  )
  return results
}

/**
 * Check if AI moderation is available
 */
export function isAIModerationAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY
}

/**
 * Get AI moderation score for a specific category
 */
export async function getAIModerationScore(
  content: string,
  category: keyof OpenAIModerationScores
): Promise<number | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  try {
    const result = await callOpenAIModeration(content, apiKey)
    if (!result?.results?.[0]) return null
    return result.results[0].category_scores[category]
  } catch {
    return null
  }
}
