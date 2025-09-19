"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { FileText, Upload, Clock, CheckCircle, AlertCircle, Eye, LogOut } from "lucide-react"
import { ContractUpload } from "./contract-upload"
import { ContractList } from "./contract-list"
import { SignatureView } from "./signature-view"
import { StatsCards } from "./stats-cards"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data
const mockContracts: any[] = []

const mockStats = {
  totalContracts: 0,
  pendingSignatures: 0,
  completedThisMonth: 0,
  averageSigningTime: "0 jours",
}

export function Dashboard() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedContract, setSelectedContract] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  console.log('Session dans le Dashboard:', session)
  console.log('Menu déroulant ouvert:', isDropdownOpen)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                <h1 className="text-base sm:text-xl md:text-2xl font-bold text-foreground">Signature Numérique Online</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground text-[10px] xs:text-xs sm:text-sm">
                <span className="hidden sm:inline">Version </span>Pro
              </Badge>
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-8 w-8 rounded-full p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log('Bouton cliqué')
                      setIsDropdownOpen(!isDropdownOpen)
                    }}
                  >
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 cursor-pointer">
                      <span className="text-sm font-medium text-primary-foreground">
                        {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session?.user?.name || 'Utilisateur'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session?.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/auth/signin' })} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <div className="w-full overflow-x-auto">
            <TabsList className="grid w-full grid-cols-4 min-w-[320px] sm:w-auto sm:max-w-[500px]">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Tableau de bord</span>
                <span className="sm:hidden">Accueil</span>
              </TabsTrigger>
              <TabsTrigger value="contracts" className="text-xs sm:text-sm">
                Contrats
              </TabsTrigger>
              <TabsTrigger value="upload" className="text-xs sm:text-sm">
                Nouveau
              </TabsTrigger>
              <TabsTrigger value="signature" className="text-xs sm:text-sm">
                Signature
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Tableau de bord</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Gérez vos contrats et signatures électroniques
                </p>
              </div>
              <Button
                onClick={() => setActiveTab("upload")}
                className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto"
              >
                <Upload className="mr-2 h-4 w-4" />
                Nouveau contrat
              </Button>
            </div>

            <StatsCards stats={mockStats} />

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <Clock className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Activité récente
                </CardTitle>
                <CardDescription className="text-sm">Dernières actions sur vos contrats</CardDescription>
              </CardHeader>
              <CardContent>
                {mockContracts.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Aucune activité</h3>
                    <p className="text-muted-foreground">Vos contrats apparaîtront ici une fois créés</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {mockContracts.slice(0, 3).map((contract) => (
                      <div
                        key={contract.id}
                        className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 p-3 sm:p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="flex-shrink-0">
                            {contract.status === "signed" && (
                              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                            )}
                            {contract.status === "pending" && (
                              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                            )}
                            {contract.status === "draft" && (
                              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                            )}
                            {contract.status === "expired" && (
                              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground text-sm sm:text-base truncate">{contract.name}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {contract.signedBy} sur {contract.totalSigners} signataires
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-2">
                          <Progress value={contract.progress} className="flex-1 sm:w-20 sm:flex-none" />
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contracts">
            <ContractList contracts={mockContracts} onSelectContract={setSelectedContract} />
          </TabsContent>

          <TabsContent value="upload">
            <ContractUpload />
          </TabsContent>

          <TabsContent value="signature">
            <SignatureView contractId={selectedContract} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
