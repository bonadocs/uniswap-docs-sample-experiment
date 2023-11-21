import { Provider } from 'ethers'

import { WidgetExecutor } from './execution'
import { WidgetConfiguration } from './types'

export * from './execution'
export * from './FunctionFragmentView'
export * from './simulation'
export * from './types'

export async function loadWidgetExecutor(uri: string): Promise<WidgetExecutor> {
  const config = await loadWidgetConfiguration(uri)
  return new WidgetExecutor(config.chainId, config.functions)
}

/**
 * This will load from IPFS. This is just a dummy implementation.
 */
async function loadWidgetConfiguration(_: string): Promise<WidgetConfiguration> {
  return {
    chainId: 1,
    collectionURI: 'uniswap-v2.bonadocs.eth',
    functions: [
      {
        address: '0x37823478348734784378349834',
        fragment: {
          constant: true,
          inputs: [
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'address', name: '', type: 'address' },
          ],
          name: 'getPair',
          outputs: [{ internalType: 'address', name: '', type: 'address' }],
          payable: false,
          stateMutability: 'view',
          type: 'function',
        },
      },
    ],
  }
}

export async function getConnectedProvider(): Promise<Provider | null> {
  // get ethers provider from window.ethereum
  if (!window.ethereum) {
    return null
  }
}
