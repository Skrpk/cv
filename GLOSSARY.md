# CV & Job Application Assistant

A personal tool that reads the job posting on the page you're viewing, compares it against your CV, and tracks the roles you apply to on a Notion board. Built to grow into a personal job-hunting agent.

## Language

**CV**:
The canonical description of your experience and skills. There is exactly one, kept as a Markdown file in this repo; everything that reasons about "you" reads from it.
_Avoid_: resume, profile

**Job Description** (JD):
A single open role as described on a web page — its requirements, responsibilities, company, and title. One page you are looking at is one JD.
_Avoid_: job post, listing, vacancy

**Analysis**:
The comparison of one JD against the CV, produced on demand. Always made of a Match Score, Strengths, Gaps, and tailoring tips.
_Avoid_: review, report, evaluation

**Match Score**:
A 0–100 judgement of how well the CV fits one JD. One number per Analysis.
_Avoid_: rating, fit percentage, grade

**Strength**:
A requirement in the JD that the CV clearly meets.
_Avoid_: match, hit, pro

**Gap**:
A requirement in the JD that the CV does not meet or does not mention.
_Avoid_: weakness, miss, con

**Application**:
Your decision to pursue one JD, recorded as a single card on the Board. Identified by the JD's URL — one URL is one Application.
_Avoid_: entry, submission, ticket, card

**Board**:
The Notion kanban that holds every Application. There is one Board.
_Avoid_: pipeline, tracker, database

**Stage**:
Where an Application currently sits in the hiring process. The ordered set is: Applied, HR Interview, Code Assignment, Tech Interview, Final Interview, Offer, Rejected. Offer and Rejected are terminal.
_Avoid_: status, column, step, state

**Tailor** _(planned)_:
On-demand generation of a JD-specific cover letter and targeted CV-tweak suggestions for one Application.
_Avoid_: customize, rewrite

**Follow-up Nudge** _(planned)_:
A flag raised when an Application has sat in one Stage longer than expected.
_Avoid_: reminder, alert, ping
