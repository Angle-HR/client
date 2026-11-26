'use client'

import { useState } from 'react'

import { Tag } from '@/components/ui/tags'

export default function TagRemovable() {
  const [skills, setSkills] = useState(['Figma', 'Research', 'Prototyping'])
  return (
    <div className="flex flex-wrap items-center gap-8">
      {skills.map((skill) => (
        <Tag
          key={skill}
          label={skill}
          removable
          onRemove={() => setSkills((s) => s.filter((x) => x !== skill))}
        />
      ))}
      {skills.length === 0 && (
        <button
          type="button"
          className="text-body-s text-text-secondary underline"
          onClick={() => setSkills(['Figma', 'Research', 'Prototyping'])}
        >
          Reset
        </button>
      )}
    </div>
  )
}
