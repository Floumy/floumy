export function getInputGroupErrorClass(isError) {
  let classes = "input-group-merge input-group-alternative";
  if (isError) {
    classes += " border border-danger";
  }
  return classes;
}
