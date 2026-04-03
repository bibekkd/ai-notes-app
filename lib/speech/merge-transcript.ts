type MergeTranscriptInput = {
  currentContent: string;
  transcript: string;
  selectionStart?: number;
  selectionEnd?: number;
};

type MergeTranscriptResult = {
  nextContent: string;
  nextCursorPosition: number;
  insertedText: string;
};

export function mergeTranscriptIntoContent({
  currentContent,
  transcript,
  selectionStart = currentContent.length,
  selectionEnd = currentContent.length,
}: MergeTranscriptInput): MergeTranscriptResult {
  const cleanedTranscript = transcript.trim();

  if (!cleanedTranscript) {
    return {
      nextContent: currentContent,
      nextCursorPosition: selectionEnd,
      insertedText: "",
    };
  }

  const safeSelectionStart = Math.max(0, Math.min(selectionStart, currentContent.length));
  const safeSelectionEnd = Math.max(
    safeSelectionStart,
    Math.min(selectionEnd, currentContent.length)
  );

  const needsLeadingSpace =
    safeSelectionStart > 0 && /\S$/.test(currentContent.slice(0, safeSelectionStart));
  const needsTrailingSpace =
    safeSelectionEnd < currentContent.length &&
    /^\S/.test(currentContent.slice(safeSelectionEnd));

  const insertedText = `${needsLeadingSpace ? " " : ""}${cleanedTranscript}${needsTrailingSpace ? " " : ""}`;
  const nextContent =
    currentContent.slice(0, safeSelectionStart) +
    insertedText +
    currentContent.slice(safeSelectionEnd);

  return {
    nextContent,
    nextCursorPosition: safeSelectionStart + insertedText.length,
    insertedText,
  };
}
