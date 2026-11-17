import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText,
  Search,
  X,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  User,
  ExternalLink,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "@/routes/RouterContext"
import { getApplicationByReference } from "@/services/applicationService"

export function PublicServiceDialog({ isOpen, onClose, mode, onSelectApplicantLogin }) {
  const { navigate } = useRouter()
  const [searchMode, setSearchMode] = useState("name")
  const [nameQuery, setNameQuery] = useState("")
  const [refQuery, setRefQuery] = useState("")
  const [birthDateQuery, setBirthDateQuery] = useState("")
  const [trackedResult, setTrackedResult] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchNotFound, setSearchNotFound] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const isRefFormat = (val) => /^(MSWDO|REF|[A-Z]{2,}-\d{4})/i.test((val || "").trim())

  if (!isOpen) return null

  const handleSearch = async (e) => {
    e.preventDefault()
    const query = (searchMode === "name" ? nameQuery : refQuery).trim()
    const bday = birthDateQuery.trim()

    if (!query) {
      setErrorMessage(
        searchMode === "name"
          ? "Please enter the applicant's full name."
          : "Please enter the application reference number."
      )
      return
    }
    if (!bday) {
      setErrorMessage("Please enter your applicant birthdate.")
      return
    }

    setErrorMessage("")
    setIsSearching(true)
    setHasSearched(true)
    setSearchNotFound(false)

    try {
      const app = await getApplicationByReference(query, bday)
      if (app) {
        // Found live application -> navigate directly to full details page
        onClose()
        const params = new URLSearchParams()
        if (app.name && !isRefFormat(app.name)) params.set("name", app.name)
        if (app.reference) params.set("ref", app.reference)
        params.set("dob", bday)
        navigate(`/track?${params.toString()}`)
        return
      } else {
        setTrackedResult(null)
        setSearchNotFound(true)
      }
    } catch (err) {
      console.warn("Tracking lookup error:", err)
      setSearchNotFound(true)
    } finally {
      setIsSearching(false)
    }
  }

  const assistancePrograms = [
    {
      title: "AICS — Medical & Hospitalization Assistance",
      desc: "Emergency financial aid for inpatient care, medicine purchase, and diagnostic tests.",
      tag: "Crisis Relief",
    },
    {
      title: "Tertiary Educational Assistance Program",
      desc: "Financial grant subsidy for indigent college and technical-vocational students.",
      tag: "Youth Aid",
    },
    {
      title: "Senior Citizen Welfare & Special Social Pension",
      desc: "Quarterly stipend and health assistance for indigent senior citizens in Carmen.",
      tag: "Elderly Care",
    },
    {
      title: "Solo Parent & Livelihood Grant Program",
      desc: "Livelihood capital assistance and psychosocial services for solo parents.",
      tag: "Livelihood",
    },
  ]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal Window with Pure Solid White Background */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[5px] shadow-2xl p-6 overflow-hidden z-10 my-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-[5px] bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-900/50">
                {mode === "apply" ? (
                  <FileText className="size-5" />
                ) : (
                  <Search className="size-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground tracking-tight">
                  {mode === "apply" ? "Program Application" : "Track Application"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {mode === "apply"
                    ? "Municipal Social Welfare & Development Office • Carmen LGU"
                    : "Check the status of your submitted welfare assistance request"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-[5px] text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
              aria-label="Close dialog"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Content Area */}
          <div className="py-4 space-y-4">
            {mode === "apply" ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Carmen residents can apply for municipal welfare assistance programs online. Review available programs below or sign in to submit your requirements:
                </p>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {assistancePrograms.map((prog, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-[5px] border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 hover:border-blue-300 dark:hover:border-blue-800 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-foreground">
                          {prog.title}
                        </p>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-[5px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                          {prog.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {prog.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="brand"
                    className="w-full h-10 text-xs font-semibold rounded-[5px] gap-2"
                    onClick={() => {
                      onClose()
                      onSelectApplicantLogin?.()
                    }}
                  >
                    <UserCheck className="size-4" />
                    Sign In with Applicant Account to Apply
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Search Mode Switcher with Prominent OR */}
                <div className="flex items-center justify-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-[6px] border border-zinc-200/80 dark:border-zinc-700/80 w-full text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchMode("name")
                      if (searchNotFound) setSearchNotFound(false)
                      if (errorMessage) setErrorMessage("")
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-[5px] text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      searchMode === "name"
                        ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <User className="size-3" />
                    <span>Applicant Name</span>
                  </button>

                  <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white font-extrabold text-[9px] tracking-wider shadow-xs select-none">
                    OR
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setSearchMode("reference")
                      if (searchNotFound) setSearchNotFound(false)
                      if (errorMessage) setErrorMessage("")
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-[5px] text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      searchMode === "reference"
                        ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <FileText className="size-3" />
                    <span>Reference No.</span>
                  </button>
                </div>

                <form onSubmit={handleSearch} className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <span>{searchMode === "name" ? "Applicant Full Name" : "Application reference"}</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchMode(searchMode === "name" ? "reference" : "name")
                          if (searchNotFound) setSearchNotFound(false)
                          if (errorMessage) setErrorMessage("")
                        }}
                        className="text-[10.5px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Use {searchMode === "name" ? "Reference Number" : "Applicant Name"} instead
                      </button>
                    </div>
                    <div className="relative">
                      {searchMode === "name" ? (
                        <User className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      ) : (
                        <FileText className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      )}
                      <Input
                        type="text"
                        value={searchMode === "name" ? nameQuery : refQuery}
                        onChange={(e) => {
                          if (searchMode === "name") {
                            setNameQuery(e.target.value)
                          } else {
                            setRefQuery(e.target.value)
                          }
                          if (searchNotFound) setSearchNotFound(false)
                          if (errorMessage) setErrorMessage("")
                        }}
                        placeholder={searchMode === "name" ? "e.g. Juan Dela Cruz" : "MSWDO-2026-XXXXXXXXXX"}
                        className="pl-8.5 rounded-[5px] text-xs h-9 bg-white dark:bg-zinc-800 font-medium uppercase"
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {searchMode === "name"
                        ? "Enter the applicant's complete name as registered."
                        : "Enter the complete reference exactly as issued."}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Applicant birthdate<span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={birthDateQuery}
                      onChange={(e) => {
                        setBirthDateQuery(e.target.value)
                        if (searchNotFound) setSearchNotFound(false)
                        if (errorMessage) setErrorMessage("")
                      }}
                      max={new Date().toISOString().split("T")[0]}
                      className="rounded-[5px] text-xs h-9 bg-white dark:bg-zinc-800"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Used only to securely locate this application.
                    </p>
                  </div>

                  {errorMessage && (
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1.5 pt-0.5">
                      <AlertCircle className="size-3.5 shrink-0" />
                      {errorMessage}
                    </p>
                  )}

                  <Button
                    type="submit"
                    variant="brand"
                    disabled={isSearching}
                    className="w-full rounded-[5px] text-xs font-semibold h-9 cursor-pointer gap-1.5 mt-1"
                  >
                    {isSearching ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Search className="size-3.5" />
                    )}
                    Track Application
                  </Button>
                </form>

                {/* Not Found Alert */}
                {searchNotFound && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-[5px] border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/60 space-y-2 text-xs"
                  >
                    <div className="flex items-start gap-2 text-amber-800 dark:text-amber-300">
                      <AlertCircle className="size-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">No Application Found</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          We couldn't locate an application matching <strong className="font-semibold text-foreground">{searchMode === "name" ? nameQuery : refQuery}</strong> and the provided birthdate. Please verify your details.
                        </p>
                      </div>
                    </div>
                    <div className="pt-1 flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] rounded-[4px] w-full"
                        onClick={() => {
                          onClose()
                          const params = new URLSearchParams()
                          if (searchMode === "name" && nameQuery.trim()) {
                            params.set("name", nameQuery.trim())
                          } else if (searchMode === "reference" && refQuery.trim()) {
                            params.set("ref", refQuery.trim())
                          }
                          if (birthDateQuery.trim()) {
                            params.set("dob", birthDateQuery.trim())
                          }
                          navigate(`/track?${params.toString()}`)
                        }}
                      >
                        Open Search Page
                      </Button>
                    </div>
                  </motion.div>
                )}

                <div className="pt-2 flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-9 text-xs font-medium rounded-[5px] gap-1.5"
                    onClick={() => {
                      onClose()
                      navigate("/track")
                    }}
                  >
                    Open Dedicated Tracking Page
                    <ExternalLink className="size-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default PublicServiceDialog
