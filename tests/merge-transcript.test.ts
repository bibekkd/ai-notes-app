import test from "node:test";
import assert from "node:assert/strict";

import { mergeTranscriptIntoContent } from "../lib/speech/merge-transcript.ts";

test("appends transcript to empty content", () => {
  const result = mergeTranscriptIntoContent({
    currentContent: "",
    transcript: "hello world",
  });

  assert.equal(result.nextContent, "hello world");
  assert.equal(result.nextCursorPosition, 11);
});

test("trims incoming transcript before inserting", () => {
  const result = mergeTranscriptIntoContent({
    currentContent: "",
    transcript: "  hello world  ",
  });

  assert.equal(result.nextContent, "hello world");
  assert.equal(result.insertedText, "hello world");
});

test("adds a leading space when appending after a word", () => {
  const result = mergeTranscriptIntoContent({
    currentContent: "Shopping list",
    transcript: "buy milk",
  });

  assert.equal(result.nextContent, "Shopping list buy milk");
});

test("does not add a duplicate leading space when content already ends with whitespace", () => {
  const result = mergeTranscriptIntoContent({
    currentContent: "Shopping list ",
    transcript: "buy milk",
  });

  assert.equal(result.nextContent, "Shopping list buy milk");
});

test("inserts transcript in the middle with spaces on both sides when needed", () => {
  const result = mergeTranscriptIntoContent({
    currentContent: "Start end",
    transcript: "middle",
    selectionStart: 5,
    selectionEnd: 5,
  });

  assert.equal(result.nextContent, "Start middle end");
  assert.equal(result.nextCursorPosition, 12);
});

test("replaces selected text with the transcript", () => {
  const result = mergeTranscriptIntoContent({
    currentContent: "Hello old note",
    transcript: "new",
    selectionStart: 6,
    selectionEnd: 9,
  });

  assert.equal(result.nextContent, "Hello new note");
});

test("inserts at the beginning without a leading space", () => {
  const result = mergeTranscriptIntoContent({
    currentContent: "existing text",
    transcript: "Fresh",
    selectionStart: 0,
    selectionEnd: 0,
  });

  assert.equal(result.nextContent, "Fresh existing text");
});

test("adds a trailing space when the next character is part of a word", () => {
  const result = mergeTranscriptIntoContent({
    currentContent: "HelloWorld",
    transcript: "beautiful",
    selectionStart: 5,
    selectionEnd: 5,
  });

  assert.equal(result.nextContent, "Hello beautiful World");
  assert.equal(result.insertedText, " beautiful ");
});

test("does not add a trailing space when the next character is already whitespace", () => {
  const result = mergeTranscriptIntoContent({
    currentContent: "Hello world",
    transcript: "beautiful",
    selectionStart: 5,
    selectionEnd: 5,
  });

  assert.equal(result.nextContent, "Hello beautiful world");
  assert.equal(result.insertedText, " beautiful");
});

test("leaves content unchanged when transcript is blank", () => {
  const result = mergeTranscriptIntoContent({
    currentContent: "Existing note",
    transcript: "   ",
    selectionStart: 8,
    selectionEnd: 8,
  });

  assert.equal(result.nextContent, "Existing note");
  assert.equal(result.insertedText, "");
  assert.equal(result.nextCursorPosition, 8);
});
