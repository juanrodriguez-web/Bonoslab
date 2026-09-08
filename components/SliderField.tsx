"use client";

import { number } from "@/lib/format";

export default function SliderField({ label, value, min, max, step, suffix, onChange }: { label: string; value: number; min: number; max: number; step: number; suffix?: string; onChange: (value: number) => void; }) {
  const progress = ((value - min) / (max - min)) * 100;
  return (
    <label className="slider-field">
      <span><b>{label}</b><strong>{number(value)}{suffix ?? ""}</strong></span>
      <input style={{ "--progress": `${progress}%` } as React.CSSProperties} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <small><span>{number(min)}{suffix ?? ""}</span><span>{number(max)}{suffix ?? ""}</span></small>
    </label>
  );
}
