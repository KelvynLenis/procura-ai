'use client'

import { FC } from 'react'
import { GovBrAuthService } from '@/lib/govbr/client'

interface GovBrButtonProps {
  className?: string
}

const GovBrButton: FC<GovBrButtonProps> = ({ className }) => {
  const handleGovBrLogin = () => {
    GovBrAuthService.login()
  }

  return (
    <button
      onClick={handleGovBrLogin}
      type="button"
      className={`bg-[#1351B4] text-white font-medium rounded-full py-2 px-6 hover:bg-[#0D47A1] transition-colors duration-300 ${className}`}
    >
      Entrar com <span className="font-bold">gov.br</span>
    </button>
  )
}

export default GovBrButton