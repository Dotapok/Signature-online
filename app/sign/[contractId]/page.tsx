"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PenTool, RefreshCw, CheckCircle, Shield, FileText, Clock, User } from "lucide-react"

interface SignRecipientPageProps {
  params: {
    contractId: string
  }
}

export default function SignRecipientPage({ params }: SignRecipientPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [signerName, setSignerName] = useState("")
  const [signerEmail, setSignerEmail] = useState("")
  const [hasSignature, setHasSignature] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const contractData = {
    id: params.contractId,
    name: "Document à signer",
    company: "",
    description: "Veuillez consulter le document ci-dessous",
    pages: 1,
    requesterName: "",
    requesterEmail: "",
    recipientEmail: "",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
    createdAt: new Date().toISOString().split("T")[0],
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = 200

    // Set drawing styles
    ctx.strokeStyle = "#374151"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSignature(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const submitSignature = () => {
    if (!hasSignature || !signerName || !signerEmail) {
      alert("Veuillez remplir tous les champs et signer le document")
      return
    }

    // Mock signature submission
    console.log("Submitting signature:", {
      contractId: params.contractId,
      signerName,
      signerEmail,
      signature: canvasRef.current?.toDataURL(),
      timestamp: new Date().toISOString(),
    })

    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Signature enregistrée !</h2>
            <p className="text-muted-foreground mb-4">
              Votre signature a été enregistrée avec succès. Toutes les parties seront notifiées.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>Contrat : {contractData.name}</p>
              <p>Signé le : {new Date().toLocaleDateString("fr-FR")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">SignaturePro</h1>
                <p className="text-sm text-muted-foreground">Signature électronique sécurisée</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Shield className="mr-1 h-3 w-3" />
              Sécurisé SSL
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Contract Info Banner */}
        <Card className="mb-8 border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-2">{contractData.name}</h2>
                <p className="text-muted-foreground mb-4">{contractData.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>De : {contractData.requesterName || "Expéditeur"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {contractData.pages} page{contractData.pages > 1 ? "s" : ""} • PDF
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Expire le : {new Date(contractData.expiresAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Document Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Document à signer
                </CardTitle>
                <CardDescription>Veuillez lire attentivement le document avant de signer</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Mock PDF viewer with more realistic content */}
                <div className="border border-border rounded-lg bg-white shadow-inner">
                  {/* PDF Header */}
                  <div className="bg-gray-100 px-4 py-2 border-b border-border flex items-center justify-between">
                    <span className="text-sm font-medium">Page 1 sur {contractData.pages}</span>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Zoom -
                      </Button>
                      <Button variant="outline" size="sm">
                        100%
                      </Button>
                      <Button variant="outline" size="sm">
                        Zoom +
                      </Button>
                    </div>
                  </div>

                  {/* PDF Content */}
                  <div className="p-8 min-h-[500px] bg-white">
                    <div className="max-w-2xl mx-auto space-y-6">
                      <div className="text-center border-b pb-4">
                        <h1 className="text-2xl font-bold text-gray-900">DOCUMENT À SIGNER</h1>
                        <p className="text-gray-600 mt-2">Contrat électronique</p>
                      </div>

                      <div className="space-y-4 text-sm text-gray-800 leading-relaxed">
                        <p>
                          <strong>Document en attente de contenu</strong>
                        </p>
                        <p>Ce document sera rempli avec le contenu du contrat une fois uploadé par l'expéditeur.</p>

                        <div className="bg-blue-50 border border-blue-200 rounded p-4 mt-8">
                          <p className="text-sm text-blue-800">
                            <strong>Zone de signature requise</strong>
                            <br />
                            Votre signature électronique sera requise en bas de ce document.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Signature Panel */}
          <div className="space-y-6">
            {/* Signer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vos informations</CardTitle>
                <CardDescription>Complétez vos informations pour signer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signer-name">Nom complet *</Label>
                  <Input
                    id="signer-name"
                    placeholder="Votre nom complet"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signer-email">Email *</Label>
                  <Input
                    id="signer-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={signerEmail}
                    onChange={(e) => setSignerEmail(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Signature Pad */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <PenTool className="mr-2 h-5 w-5" />
                  Signature manuscrite
                </CardTitle>
                <CardDescription>Dessinez votre signature dans la zone ci-dessous</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-2 bg-white">
                  <canvas
                    ref={canvasRef}
                    className="w-full cursor-crosshair bg-white rounded"
                    style={{ height: "200px" }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={clearSignature} className="flex-1 bg-transparent">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Effacer
                  </Button>
                </div>

                {hasSignature && (
                  <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">✓ Signature détectée</div>
                )}
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Signature légalement contraignante</p>
                    <p className="text-muted-foreground mt-1">
                      Votre signature électronique a la même valeur juridique qu'une signature manuscrite.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              onClick={submitSignature}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3"
              disabled={!hasSignature || !signerName || !signerEmail}
              size="lg"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Signer le contrat
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              En signant, vous acceptez les termes et conditions du contrat
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
