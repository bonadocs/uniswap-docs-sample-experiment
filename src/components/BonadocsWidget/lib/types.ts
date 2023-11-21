import { BigNumberish, JsonFragment } from 'ethers'

export interface FunctionConfiguration {
  address: string
  fragment: JsonFragment
}

export interface WidgetConfiguration {
  chainId: number
  functions: FunctionConfiguration[]
  collectionURI: string
}

interface FragmentDisplayDataEntry {
  baseType: string
  indent: number
  index: number
  name: string
  path: string
  length?: number
}

export type FragmentDisplayData = FragmentDisplayDataEntry[]

type SimpleContractParamValue = string | boolean | BigNumberish
export type ContractParamValue = SimpleContractParamValue | ContractParam
export type ContractParam = Array<ContractParamValue>
