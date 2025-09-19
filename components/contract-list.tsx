"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Eye, Download, Send, MoreHorizontal, CheckCircle, Clock, FileText, AlertCircle } from "lucide-react"

interface Contract {
  id: string
  name: string
  status: "draft" | "pending" | "signed" | "expired"
  signers: string[]
  createdAt: string
  progress: number
  totalSigners: number
  signedBy: number
}

interface ContractListProps {
  contracts: Contract[]
  onSelectContract: (contractId: string) => void
}

const statusConfig = {
  draft: { label: "Brouillon", color: "bg-gray-100 text-gray-800", icon: FileText },
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  signed: { label: "Signé", color: "bg-green-100 text-green-800", icon: CheckCircle },
  expired: { label: "Expiré", color: "bg-red-100 text-red-800", icon: AlertCircle },
}

export function ContractList({ contracts, onSelectContract }: ContractListProps) {
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: {
      view?: boolean
      download?: boolean
      send?: boolean
      more?: boolean
    }
  }>({})

  const updateLoadingState = (contractId: string, action: 'view' | 'download' | 'send' | 'more', isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [contractId]: {
        ...prev[contractId],
        [action]: isLoading
      }
    }))
  }

  const handleView = async (contractId: string) => {
    updateLoadingState(contractId, 'view', true)
    try {
      await onSelectContract(contractId)
    } finally {
      updateLoadingState(contractId, 'view', false)
    }
  }

  const handleDownload = async (contractId: string) => {
    updateLoadingState(contractId, 'download', true)
    try {
      // Simulate API call for download
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert(`Téléchargement du contrat ${contractId}`)
    } finally {
      updateLoadingState(contractId, 'download', false)
    }
  }

  const handleSend = async (contractId: string) => {
    updateLoadingState(contractId, 'send', true)
    try {
      // Simulate API call for send
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert(`Envoi du contrat ${contractId} pour signature`)
    } finally {
      updateLoadingState(contractId, 'send', false)
    }
  }

  const handleMoreOptions = async (contractId: string) => {
    updateLoadingState(contractId, 'more', true)
    try {
      // Simulate API call for more options
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert(`Options supplémentaires pour le contrat ${contractId}`)
    } finally {
      updateLoadingState(contractId, 'more', false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Mes contrats</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez tous vos contrats et leur statut de signature
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs sm:text-sm">
            {contracts.length} contrats
          </Badge>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {contracts.map((contract) => {
          const StatusIcon = statusConfig[contract.status].icon

          return (
            <Card key={contract.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      <StatusIcon className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3 mb-2">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{contract.name}</h3>
                        <Badge variant="secondary" className={`${statusConfig[contract.status].color} text-xs w-fit`}>
                          {statusConfig[contract.status].label}
                        </Badge>
                      </div>

                      <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-muted-foreground">
                        <span>Créé le {new Date(contract.createdAt).toLocaleDateString("fr-FR")}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>
                          {contract.signedBy} sur {contract.totalSigners} signataires
                        </span>
                        {contract.signers.length > 0 && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span className="truncate">{contract.signers.join(", ")}</span>
                          </>
                        )}
                      </div>

                      {contract.status === "pending" && (
                        <div className="mt-3">
                          <div className="flex items-center space-x-2">
                            <Progress value={contract.progress} className="flex-1" />
                            <span className="text-xs sm:text-sm text-muted-foreground">{contract.progress}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-1 sm:space-x-2 sm:ml-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleView(contract.id)}
                      disabled={!!loadingStates[contract.id]?.view}
                    >
                      {loadingStates[contract.id]?.view ? (
                        <div className="h-4 w-4 border-2 border-muted-foreground/50 border-t-muted-foreground rounded-full animate-spin" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">Voir</span>
                    </Button>

                    {contract.status === "signed" && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDownload(contract.id)} 
                        disabled={!!loadingStates[contract.id]?.download}
                      >
                        {loadingStates[contract.id]?.download ? (
                          <div className="h-4 w-4 border-2 border-muted-foreground/50 border-t-muted-foreground rounded-full animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        <span className="sr-only">Télécharger</span>
                      </Button>
                    )}

                    {contract.status === "draft" && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSend(contract.id)} 
                        disabled={!!loadingStates[contract.id]?.send}
                      >
                        {loadingStates[contract.id]?.send ? (
                          <div className="h-4 w-4 border-2 border-muted-foreground/50 border-t-muted-foreground rounded-full animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        <span className="sr-only">Envoyer</span>
                      </Button>
                    )}

                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleMoreOptions(contract.id)}
                      disabled={!!loadingStates[contract.id]?.more}
                    >
                      {loadingStates[contract.id]?.more ? (
                        <div className="h-4 w-4 border-2 border-muted-foreground/50 border-t-muted-foreground rounded-full animate-spin" />
                      ) : (
                        <MoreHorizontal className="h-4 w-4" />
                      )}
                      <span className="sr-only">Plus d'options</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {contracts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Aucun contrat trouvé</h3>
            <p className="text-muted-foreground mb-4">Commencez par uploader votre premier contrat</p>
            <Button 
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => onSelectContract('new')}
            >
              Nouveau contrat
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
