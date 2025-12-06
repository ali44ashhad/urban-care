// src/hooks/useForm.js
import { useCallback, useMemo, useState } from 'react'

/**
 * useForm
 *
 * Lightweight form state manager.
 *
 * - initialValues: object
 * - validate: (values) => errors object (synchronous). If omitted no validation performed.
 *
 * Returns:
 * - values, setField(name, value), handleChange (for inputs), errors, touched, handleBlur, isValid, reset, handleSubmit(asyncSubmitFn)
 *
 * Usage:
 * const { values, handleChange, handleSubmit, errors } = useForm({ initialValues: { name:'' }, validate: (v)=>({...}) })
 * <input name="name" value={values.name} onChange={handleChange} onBlur={handleBlur} />
 * <form onSubmit={handleSubmit(async (vals)=>{ await api.save(vals) })}></form>
 */
export default function useForm({ initialValues = {}, validate = null } = {}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const setField = useCallback((name, value) => {
    setValues(v => ({ ...v, [name]: value }))
    // clear error when user types
    setErrors(e => ({ ...e, [name]: undefined }))
  }, [])

  const handleChange = useCallback((e) => {
    const target = e.target
    const val = target.type === 'checkbox' ? target.checked : (target.value === undefined ? '' : target.value)
    setField(target.name, val)
  }, [setField])

  const handleBlur = useCallback((e) => {
    const name = e.target.name
    setTouched(t => ({ ...t, [name]: true }))
    if (validate) {
      const res = validate(values) || {}
      setErrors(res)
    }
  }, [validate, values])

  const reset = useCallback((nextValues = initialValues) => {
    setValues(nextValues)
    setErrors({})
    setTouched({})
    setSubmitting(false)
  }, [initialValues])

  const isValid = useMemo(() => {
    if (!validate) return true
    const res = validate(values) || {}
    return Object.keys(res).length === 0
  }, [validate, values])

  const handleSubmit = useCallback((onSubmit) => async (e) => {
    e?.preventDefault()
    if (validate) {
      const res = validate(values) || {}
      setErrors(res)
      if (Object.keys(res).length) return Promise.reject(res)
    }
    try {
      setSubmitting(true)
      const result = await onSubmit(values)
      setSubmitting(false)
      return result
    } catch (err) {
      setSubmitting(false)
      throw err
    }
  }, [validate, values])

  return {
    values,
    setValues,
    setField,
    handleChange,
    handleBlur,
    errors,
    touched,
    reset,
    isValid,
    submitting,
    handleSubmit
  }
}
