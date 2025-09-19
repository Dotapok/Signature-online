"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PenTool, RefreshCw, CheckCircle, Shield, Clock } from "lucide-react"

interface SignatureViewProps {
  contractId: string | null
}

export function SignatureView({ contractId }: SignatureViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [signerName, setSignerName] = useState("")
  const [signerEmail, setSignerEmail] = useState("")
  const [hasSignature, setHasSignature] = useState(false)
  const [isSigning, setIsSigning] = useState(false)

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

  const submitSignature = async () => {
    if (!hasSignature || !signerName || !signerEmail) {
      alert("Veuillez remplir tous les champs et signer le document")
      return
    }

    setIsSigning(true)
    // Mock signature submission
    console.log("Submitting signature:", {
      contractId,
      signerName,
      signerEmail,
      signature: canvasRef.current?.toDataURL(),
    })

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    alert("Signature enregistrée avec succès !")
    setIsSigning(false)
  }

  if (!contractId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Signature électronique</h2>
          <p className="text-muted-foreground">Sélectionnez un contrat pour commencer la signature</p>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <PenTool className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Aucun contrat sélectionné</h3>
            <p className="text-muted-foreground">
              Allez dans l'onglet "Contrats" pour sélectionner un document à signer
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Signature électronique</h2>
          <p className="text-muted-foreground">Signez le contrat sélectionné de manière sécurisée</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Shield className="mr-1 h-3 w-3" />
            Sécurisé SSL
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Document Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Document à signer</CardTitle>
              <CardDescription>Document • 1 page • PDF</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border border-border rounded-lg p-8 bg-muted/30 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-20 bg-gray-400 rounded mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">PDF</span>
                  </div>
                  <p className="text-muted-foreground">Aucun document sélectionné</p>
                  <p className="text-sm text-muted-foreground mt-2">Le document apparaîtra ici une fois sélectionné</p>
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
              <CardTitle className="text-lg">Informations du signataire</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signer-name">Nom complet</Label>
                <Input
                  id="signer-name"
                  placeholder="Votre nom complet"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signer-email">Email</Label>
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
              <CardTitle className="text-lg">Votre signature</CardTitle>
              <CardDescription>Dessinez votre signature dans la zone ci-dessous</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-2">
                <canvas
                  ref={canvasRef}
                  className="w-full cursor-crosshair bg-white rounded"
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
            </CardContent>
          </Card>

          {/* Security Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Signature sécurisée</p>
                  <p className="text-muted-foreground">
                    Votre signature est chiffrée et horodatée pour garantir son authenticité.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            onClick={submitSignature}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={isSigning || !hasSignature || !signerName || !signerEmail}
          >
            {isSigning ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4 animate-pulse" />
                Signature en cours...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Signer le contrat
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des signatures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Aucune signature</h3>
            <p className="text-muted-foreground">L'historique des signatures apparaîtra ici</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
