"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Facebook, Instagram, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface SocialAccount {
  id: string
  name: string
  picture?: string
  category?: string
  username?: string
}

type Platform = "facebook" | "instagram"

interface SocialAccountSelectorProps {
  accounts: SocialAccount[]
  isLoading: boolean
  error: string | null
  onSelectAccount: (accountId: string) => void
  onClose: () => void
  platform: Platform
}

const platformConfig = {
  facebook: {
    name: "Facebook",
    accountType: "Page",
    accountTypePlural: "Pages",
    icon: Facebook,
    color: "bg-blue-600 hover:bg-blue-700",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  instagram: {
    name: "Instagram",
    accountType: "Account",
    accountTypePlural: "Accounts",
    icon: Instagram,
    color: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
    iconColor: "text-pink-600",
    iconBg: "bg-pink-100",
  },
}

export default function SocialAccountSelector({
  accounts,
  isLoading,
  error,
  onSelectAccount,
  onClose,
  platform,
}: SocialAccountSelectorProps) {
  const config = platformConfig[platform]
  const PlatformIcon = config.icon


  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
        staggerChildren: 0.1,
      },
    },
    exit: { opacity: 0, scale: 0.95 },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }



  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose()
          }
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${config.iconBg}`}>
                <PlatformIcon className={`h-6 w-6 ${config.iconColor}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Select a {config.name} {config.accountType}
                </h2>
                <p className="text-gray-600 mt-1">
                  Select the {config.name} {config.accountType.toLowerCase()} you'd like to integrate with your account.
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <Loader2 className={`h-8 w-8 animate-spin ${config.iconColor} mb-4`} />
              <p className="text-gray-600">
                Loading your {config.name} {config.accountTypePlural}...
              </p>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
                <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Failed to load {config.accountTypePlural.toLowerCase()}
                </h3>
                <p className="text-red-700">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Accounts Grid */}
          {!isLoading && !error && accounts.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {accounts.map((account) => (
                <motion.div key={account.id} variants={itemVariants}>
                  <Card
                    className={`hover:shadow-lg transition-all duration-200 border-2 hover:border-opacity-50 ${
                      platform === "instagram" ? "hover:border-pink-200" : "hover:border-blue-200"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={account.picture || "/placeholder.svg"} alt={account.name} />
                          <AvatarFallback className={config.iconBg}>
                            <PlatformIcon className={`h-6 w-6 ${config.iconColor}`} />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{account.name}</h3>
                          {account.username && <p className="text-sm text-gray-500 truncate">@{account.username}</p>}
                          <div className="flex items-center gap-2 mt-1">
                            {account.category && (
                              <Badge variant="secondary" className="text-xs">
                                {account.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => onSelectAccount(account.id)}
                        className={`w-full text-white ${config.color}`}
                      >
                        Select {config.accountType}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* No Accounts State */}
          {!isLoading && !error && accounts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md text-center">
                <PlatformIcon className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No {config.accountTypePlural} Found</h3>
                <p className="text-gray-600">
                  We couldn't find any {config.name} {config.accountTypePlural.toLowerCase()} associated with your
                  account.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
