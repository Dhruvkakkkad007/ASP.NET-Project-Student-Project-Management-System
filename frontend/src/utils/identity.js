/**
 * Match logged-in users to their own records only.
 * Never fall back to another student/faculty via name guessing or default IDs.
 */

export function sameId(a, b) {
  if (a == null || b == null || a === '' || b === '') return false;
  const left = Number(a);
  const right = Number(b);
  return Number.isFinite(left) && Number.isFinite(right) && left === right;
}

export function emailsMatch(a, b) {
  if (!a || !b) return false;
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

export function getCurrentUserId(user) {
  const id = user?.userId != null ? Number(user.userId) : NaN;
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function allocationBelongsToStudent(alloc, user) {
  if (!alloc || !user) return false;
  const studentId = alloc.studentId ?? alloc.StudentId;
  const studentEmail = alloc.studentEmail ?? alloc.StudentEmail;
  if (getCurrentUserId(user) && sameId(studentId, user.userId)) return true;
  if (emailsMatch(studentEmail, user.email)) return true;
  return false;
}

export function allocationBelongsToFaculty(alloc, user) {
  if (!alloc || !user) return false;
  const facultyId = alloc.facultyId ?? alloc.FacultyId;
  const facultyEmail = alloc.facultyEmail ?? alloc.FacultyEmail;
  if (getCurrentUserId(user) && sameId(facultyId, user.userId)) return true;
  if (emailsMatch(facultyEmail, user.email)) return true;
  return false;
}

export function filterAllocationsForUser(allocations, user, { isAdmin = false, isFaculty = false, isStudent = false } = {}) {
  const list = Array.isArray(allocations) ? allocations : [];
  if (isAdmin) return list;
  if (!user) return [];
  if (isFaculty) return list.filter((a) => allocationBelongsToFaculty(a, user));
  if (isStudent) return list.filter((a) => allocationBelongsToStudent(a, user));
  return [];
}

export function filterTasksForAllocations(tasks, allocations) {
  const ids = new Set(
    (allocations || []).map((a) => Number(a.projectAllocationId ?? a.ProjectAllocationId))
  );
  return (tasks || []).filter((t) =>
    ids.has(Number(t.projectAllocationId ?? t.ProjectAllocationId))
  );
}
