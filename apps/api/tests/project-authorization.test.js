import assert from "node:assert/strict";
import test from "node:test";
import { requireProjectOwner } from "../src/modules/projects/project-authorization.js";

const OWNER_ID = "user-owner";
const COLLABORATOR_ID = "user-collaborator";
const UNRELATED_ID = "user-unrelated";

function projectRecord() {
  return {
    collaborators: [{ userId: COLLABORATOR_ID }],
    ownerId: OWNER_ID,
  };
}

test("allows the project owner", () => {
  assert.doesNotThrow(() => requireProjectOwner(projectRecord(), OWNER_ID));
});

test("returns 403 for a known collaborator", () => {
  assert.throws(
    () => requireProjectOwner(projectRecord(), COLLABORATOR_ID),
    (error) => error.status === 403 && error.code === "FORBIDDEN",
  );
});

test("returns 404 for an authenticated unrelated user", () => {
  assert.throws(
    () => requireProjectOwner(projectRecord(), UNRELATED_ID),
    (error) => error.status === 404 && error.code === "NOT_FOUND",
  );
});

test("returns 404 when the project does not exist", () => {
  assert.throws(
    () => requireProjectOwner(null, OWNER_ID),
    (error) => error.status === 404 && error.code === "NOT_FOUND",
  );
});
