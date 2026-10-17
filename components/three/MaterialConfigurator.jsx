'use client';

import styles from './MaterialConfigurator.module.css';
const options = [
  { name: 'Sage', value: '#6b8f5e' }, { name: 'Oat', value: '#c6af8c' }, { name: 'Ivory', value: '#e9e5db' }, { name: 'Forest', value: '#28553a' }
];
export default function MaterialConfigurator({ value = options[0].value, onChange = () => {} }) {
  return <fieldset className={styles.fieldset}><legend>Choose a finish</legend><div className={styles.swatches}>{options.map((option) => <button key={option.value} className={styles.swatch} type="button" aria-label={`${option.name} finish`} aria-pressed={value === option.value} onClick={() => onChange(option.value)}><span style={{ background: option.value }} /><small>{option.name}</small></button>)}</div></fieldset>;
}
