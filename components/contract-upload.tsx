"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, X, Plus, Send } from "lucide-react"

export function ContractUpload() {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [signers, setSigners] = useState<string[]>([""])
  const [contractName, setContractName] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const addSigner = () => {
    setSigners((prev) => [...prev, ""])
  }

  const updateSigner = (index: number, email: string) => {
    setSigners((prev) => prev.map((signer, i) => (i === index ? email : signer)))
  }

  const removeSigner = (index: number) => {
    setSigners((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Mock submission
    console.log("Submitting contract:", {
      name: contractName,
      description,
      files,
      signers: signers.filter((email) => email.trim() !== ""),
    })

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    alert("Contrat envoyé avec succès !")
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Nouveau contrat</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Téléversez un document et configurez les signataires</p>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Document</CardTitle>
            <CardDescription className="text-sm">Téléversez votre contrat (PDF, DOCX acceptés)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors ${
                dragActive ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
              <p className="text-base sm:text-lg font-medium text-foreground mb-2">Glissez-déposez vos fichiers ici</p>
              <p className="text-sm text-muted-foreground mb-3 sm:mb-4">ou cliquez pour sélectionner</p>
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.doc"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <Button asChild variant="outline" size="sm">
                <label htmlFor="file-upload" className="cursor-pointer">
                  Sélectionner des fichiers
                </label>
              </Button>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Fichiers sélectionnés</Label>
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Configuration</CardTitle>
            <CardDescription className="text-sm">Détails du contrat et signataires</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contract-name" className="text-sm font-medium">
                Nom du contrat
              </Label>
              <Input
                id="contract-name"
                placeholder="Ex: Contrat de service - Client ABC"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description (optionnel)
              </Label>
              <Textarea
                id="description"
                placeholder="Description du contrat..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="text-sm"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Signataires</Label>
                <Button variant="outline" size="sm" onClick={addSigner}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>

              {signers.map((signer, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder="email@exemple.com"
                    value={signer}
                    onChange={(e) => updateSigner(index, e.target.value)}
                    type="email"
                    className="text-sm"
                  />
                  {signers.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeSigner(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isSubmitting || files.length === 0 || !contractName || signers.filter((s) => s.trim()).length === 0}
            >
              {isSubmitting ? (
                <>
                  <Send className="mr-2 h-4 w-4 animate-pulse" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer pour signature
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
