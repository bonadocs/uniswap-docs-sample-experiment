import { BigNumberish } from 'ethers'
export interface TransactionOverrides {
  from?: string
  gasLimit?: BigNumberish
  gasPrice?: BigNumberish
  value?: BigNumberish
}

export interface SimulationAccountOverrides {
  address: string
  balance: BigNumberish
  storage: Record<string, string>
}

export interface SimulationOverrides {
  // executionTimestampSeconds: number
  accounts: SimulationAccountOverrides[]
}

export interface ExecutableEVMCall {
  to: string
  data?: string
  overrides: TransactionOverrides
  simulationOverrides?: SimulationOverrides
}

export interface ExecutionContext {
  overrides?: TransactionOverrides
  simulationOverrides?: SimulationOverrides
}
