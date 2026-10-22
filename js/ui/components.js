export function createButton(label, onClick, className = 'btn-primary') {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.className = className;
  btn.addEventListener('click', onClick);
  return btn;
}
