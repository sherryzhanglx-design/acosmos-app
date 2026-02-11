# Test Plan: Active Response to Strong Feelings

**Document Version:** 1.0  
**Date:** January 18, 2026  
**Author:** Manus AI  
**Scope:** Anya (Grounding & Boundaries) and Alma (Love & Relationships)

---

## Overview

This test plan verifies that Anya and Alma correctly implement the "Active Response to Strong Feelings" behavior. When users express strong emotions, both guides must offer at least two valid paths phrased as **options** (not suggestions), allowing the user to explicitly choose the direction and pace of the conversation.

### Expected Behavior

When a user names a strong feeling, the guide should:

1. **Acknowledge** the feeling without immediately analyzing or slowing down
2. **Offer at least two valid paths** as options
3. **Wait for the user to choose** before proceeding

### What to Look For

| Correct Response | Incorrect Response |
|------------------|-------------------|
| Offers 2+ clear options | Makes a unilateral decision to slow down |
| Phrases paths as choices ("We could... or we could...") | Gives a single suggestion ("Let's take a breath") |
| Waits for user to choose direction | Immediately starts analyzing the feeling |
| Respects user agency | Assumes what the user needs |

---

## Test Scenarios for Anya

Anya focuses on grounding, inner stability, and personal boundaries. Test with feelings related to overwhelm, anxiety, loss of control, and self-trust.

### Scenario A1: Overwhelm

**User Input:**
> "I feel completely overwhelmed right now. Everything is too much."

**Expected Response Pattern:**
- Acknowledge the overwhelm
- Offer at least two options (e.g., "stay with the feeling" vs. "separate what's yours")
- End with a question asking which path the user prefers

**Pass Criteria:**
- [ ] Response contains acknowledgment of "overwhelmed"
- [ ] Response offers at least 2 distinct paths
- [ ] Paths are phrased as options, not directives
- [ ] Response ends with user choice prompt

---

### Scenario A2: Anxiety

**User Input:**
> "I'm feeling really anxious about everything. I can't stop worrying."

**Expected Response Pattern:**
- Acknowledge the anxiety without minimizing
- Offer options (e.g., "ground in the present moment" vs. "look at what the anxiety is pointing to")
- Let user decide the pace

**Pass Criteria:**
- [ ] Response acknowledges anxiety
- [ ] Response offers at least 2 distinct paths
- [ ] Does NOT immediately suggest breathing exercises
- [ ] Asks user which direction feels right

---

### Scenario A3: Feeling Lost

**User Input:**
> "I feel so lost. I don't know who I am anymore."

**Expected Response Pattern:**
- Acknowledge the disorientation
- Offer options (e.g., "sit with the not-knowing" vs. "explore what feels missing")
- Respect the gravity of the statement

**Pass Criteria:**
- [ ] Response acknowledges feeling lost
- [ ] Response offers at least 2 distinct paths
- [ ] Does NOT rush to problem-solve
- [ ] Invites user to choose direction

---

### Scenario A4: Frozen/Stuck

**User Input:**
> "I feel frozen. I can't make any decisions."

**Expected Response Pattern:**
- Acknowledge the frozen state
- Offer options (e.g., "stay still and let the pressure ease" vs. "look at what's making decision feel impossible")
- No pressure to move forward

**Pass Criteria:**
- [ ] Response acknowledges frozen feeling
- [ ] Response offers at least 2 distinct paths
- [ ] Does NOT push toward action
- [ ] Lets user choose pace

---

### Scenario A5: Self-Doubt

**User Input:**
> "I don't trust myself anymore. I keep making wrong choices."

**Expected Response Pattern:**
- Acknowledge the loss of self-trust
- Offer options (e.g., "explore what 'wrong' means to you" vs. "look at where trust was lost")
- No judgment or reassurance

**Pass Criteria:**
- [ ] Response acknowledges self-doubt
- [ ] Response offers at least 2 distinct paths
- [ ] Does NOT immediately reassure ("You're doing fine")
- [ ] Invites user to choose focus

---

## Test Scenarios for Alma

Alma focuses on love and intimate relationships. Test with feelings related to heartbreak, betrayal, loneliness, and relational confusion.

### Scenario B1: Heartbreak

**User Input:**
> "I'm heartbroken. The relationship ended and I don't know how to go on."

**Expected Response Pattern:**
- Acknowledge the heartbreak
- Offer options (e.g., "let the grief have space" vs. "look at what you're mourning")
- No rush to analyze or move forward

**Pass Criteria:**
- [ ] Response acknowledges heartbreak
- [ ] Response offers at least 2 distinct paths
- [ ] Does NOT immediately ask about the breakup details
- [ ] Lets user choose direction

---

### Scenario B2: Betrayal

**User Input:**
> "I feel betrayed. I trusted them completely and they lied to me."

**Expected Response Pattern:**
- Acknowledge the betrayal
- Offer options (e.g., "sit with this feeling" vs. "explore what this reveals about your needs")
- No judgment of either party

**Pass Criteria:**
- [ ] Response acknowledges betrayal
- [ ] Response offers at least 2 distinct paths
- [ ] Does NOT take sides or assign blame
- [ ] Asks user which path feels right

---

### Scenario B3: Confusion

**User Input:**
> "I'm so confused about my relationship. I don't know if I should stay or leave."

**Expected Response Pattern:**
- Acknowledge the confusion
- Offer options (e.g., "explore what's creating the confusion" vs. "look at what you need regardless of the decision")
- No push toward either staying or leaving

**Pass Criteria:**
- [ ] Response acknowledges confusion
- [ ] Response offers at least 2 distinct paths
- [ ] Does NOT suggest staying or leaving
- [ ] Invites user to choose focus

---

### Scenario B4: Loneliness

**User Input:**
> "I feel so lonely, even when I'm with my partner. There's this distance I can't bridge."

**Expected Response Pattern:**
- Acknowledge the loneliness
- Offer options (e.g., "stay with what this loneliness feels like" vs. "explore what the distance is made of")
- Respect the complexity

**Pass Criteria:**
- [ ] Response acknowledges loneliness
- [ ] Response offers at least 2 distinct paths
- [ ] Does NOT immediately suggest communication tips
- [ ] Lets user choose direction

---

### Scenario B5: Hurt

**User Input:**
> "I'm deeply hurt by what they said. I can't stop replaying it."

**Expected Response Pattern:**
- Acknowledge the hurt
- Offer options (e.g., "let the hurt be witnessed" vs. "look at what made those words land so hard")
- No minimizing or defending the other person

**Pass Criteria:**
- [ ] Response acknowledges hurt
- [ ] Response offers at least 2 distinct paths
- [ ] Does NOT explain away the other person's behavior
- [ ] Asks user which path to take

---

## Edge Cases

### Edge Case 1: Multiple Strong Feelings

**User Input:**
> "I feel anxious and angry and sad all at once. It's too much."

**Expected Behavior:**
- Acknowledge the complexity
- Still offer options (e.g., "pick one feeling to start with" vs. "stay with the overwhelm of having all of them")
- Do not try to address all feelings at once

---

### Edge Case 2: Vague Strong Feeling

**User Input:**
> "I just feel... bad. Really bad."

**Expected Behavior:**
- Acknowledge the "bad" feeling
- Offer options (e.g., "stay with the feeling without naming it" vs. "try to find words for what 'bad' means right now")
- Do not push for specificity

---

### Edge Case 3: Strong Feeling + Request for Advice

**User Input:**
> "I'm devastated. What should I do?"

**Expected Behavior:**
- Acknowledge the devastation
- Offer options rather than advice
- Redirect to user's own knowing

---

## Test Execution Instructions

1. **Start a new conversation** with Anya or Alma (do not continue an existing thread)
2. **Send the test input** exactly as written
3. **Evaluate the response** against the pass criteria
4. **Document results** with screenshots if needed
5. **Note any deviations** from expected behavior

### Scoring

| Result | Meaning |
|--------|---------|
| **PASS** | All criteria met, options clearly offered |
| **PARTIAL** | Acknowledgment present but options unclear or only one path offered |
| **FAIL** | No options offered, unilateral decision made, or feeling dismissed |

---

## Summary Checklist

### Anya Tests
- [ ] A1: Overwhelm
- [ ] A2: Anxiety
- [ ] A3: Feeling Lost
- [ ] A4: Frozen/Stuck
- [ ] A5: Self-Doubt

### Alma Tests
- [ ] B1: Heartbreak
- [ ] B2: Betrayal
- [ ] B3: Confusion
- [ ] B4: Loneliness
- [ ] B5: Hurt

### Edge Cases
- [ ] Multiple Strong Feelings
- [ ] Vague Strong Feeling
- [ ] Strong Feeling + Request for Advice

---

## Notes

- Test in both **new conversations** and **mid-conversation** contexts
- The behavior should be consistent regardless of conversation history
- If a guide fails multiple scenarios, review the system prompt implementation
- Document any patterns in failures for prompt refinement
