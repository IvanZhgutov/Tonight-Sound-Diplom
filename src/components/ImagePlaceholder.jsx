// Заглушка вместо изображения — заменится на <img>, когда появятся ассеты
export default function ImagePlaceholder({ label = 'Изображение', variant = '', style }) {
  return (
    <div className={`img-placeholder ${variant}`} style={style} role="img" aria-label={label}>
      {label}
    </div>
  );
}
