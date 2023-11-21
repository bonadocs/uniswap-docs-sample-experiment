import { FunctionFragment, Interface, JsonFragment, ParamType } from 'ethers'

import { ContractParam, ContractParamValue, FragmentDisplayData } from './types'

export class FunctionFragmentView {
  private readonly _functionFragment: FunctionFragment
  private readonly _displayData: FragmentDisplayData
  private _contractInterface: Interface | null = null
  private readonly _generatedCounts: Record<string, number>
  private readonly _values: Record<string, string>

  // this works because the instance is the same
  private readonly paths: Map<ParamType, string>

  constructor(jsonFragment: JsonFragment) {
    this._functionFragment = FunctionFragment.from(jsonFragment)
    this._generatedCounts = {}
    this._values = {}
    this.paths = new Map()
    this._displayData = []
    this.generateInputDisplayData()
  }

  /**
   * @returns The contract interface for this function fragment
   */
  get contractInterface(): Interface {
    if (!this._contractInterface) {
      this._contractInterface = Interface.from([this._functionFragment])
    }
    return this._contractInterface
  }

  /**
   * Returns the flat array structure that can be used to render the
   * inputs of the function fragment. It handles nested structures and
   * arrays and enables you to focus on the rendering logic.
   */
  get displayData(): FragmentDisplayData {
    return this._displayData
  }

  /**
   * @returns The FunctionFragment for the backing function for this view
   */
  get functionFragment(): FunctionFragment {
    return this._functionFragment
  }

  /**
   * Encodes the inputs of the function fragment into a call data string.
   * This can be used to call the function on the contract.
   */
  encodeFunctionData(): string {
    return this.contractInterface.encodeFunctionData(this._functionFragment, this.computeContractArguments())
  }

  /**
   * Sets the value for the input at the given path.
   * @param path
   * @param value
   */
  setValue(path: string, value: string): void {
    this._values[path] = value
  }

  /**
   * Returns the value for the input at the given path.
   * @param path
   */
  getValue(path: string): string {
    return this._values[path]
  }

  /**
   * Adds an element to the dynamic array at the given index in the display data.
   * @param arrayDefinitionIndex The index of the array definition in the display data
   */
  addArrayItem(arrayDefinitionIndex: number) {
    this.modifyArrayElements(arrayDefinitionIndex)
  }

  /**
   * Deletes an element from the dynamic array at the given index in the display data.
   * The item to delete is selected by the indexToDelete parameter.
   *
   * @param arrayDefinitionIndex The index of the array definition in the display data
   * @param indexToDelete The index of the item to delete in the dynamic array
   */
  deleteArrayItem(arrayDefinitionIndex: number, indexToDelete: number) {
    const arrayDefinition = this._displayData[arrayDefinitionIndex]
    if (!arrayDefinition) {
      throw new Error('Invalid selection for add element')
    }

    if (arrayDefinition.baseType !== 'array' || arrayDefinition.length !== -1) {
      throw new Error('Selected element is not a dynamic array')
    }

    const arrayInputParam = this.getInputParamAtPath(arrayDefinition.path)
    if (!arrayInputParam) {
      throw new Error('Invalid array selection')
    }

    const generatedCount = this._generatedCounts[arrayDefinition.path]
    for (let i = indexToDelete; i < generatedCount; i++) {
      if (i === generatedCount - 1) {
        this.deleteValuesForPath(arrayDefinition.path + '.' + i)
        this.deleteValuesForPath(arrayDefinition.path + '.' + i)
      } else {
        this.replaceValuesForPath(arrayDefinition.path + '.' + (i + 1), arrayDefinition.path + '.' + i, false)
        this.replaceValuesForPath(arrayDefinition.path + '.' + (i + 1), arrayDefinition.path + '.' + i, false)
      }
    }
    this.modifyArrayElements(arrayDefinitionIndex, -1)
  }

  /**
   * Generate the display data for the inputs of this function fragment.
   * The display data is a flat array structure that can be used to render
   * the inputs of the function fragment. It handles nested structures and
   * arrays and enables you to focus on the rendering logic.
   */
  private generateInputDisplayData() {
    this._functionFragment.inputs.forEach((input) => {
      this.transformParamTypeToDisplayData(input, this._displayData)
    })
  }

  /**
   * Computes the contract arguments for this function fragment. It uses the
   * values set for the inputs to compute the arguments. If a value is not set
   * for an input, it throws an error.
   * @private
   */
  private computeContractArguments(): ContractParam {
    const params: ContractParam = []
    this._functionFragment.inputs.forEach((inputType) => {
      params.push(this.computeArgument(inputType))
    })
    return params
  }

  private computeArgument(inputType: ParamType): ContractParamValue {
    if (inputType.components) {
      const params: ContractParamValue[] = []
      inputType.components.forEach((componentType) => {
        params.push(this.computeArgument(componentType))
      })
      return params
    }

    if (inputType.arrayChildren) {
      const generatedCount = this._generatedCounts[inputType.name]
      const params: ContractParamValue[] = []
      for (let i = 0; i < generatedCount; i++) {
        params.push(this.computeArgument(inputType.arrayChildren))
      }
      return params
    }

    const path = this.paths.get(inputType)
    const value = this._values[path]
    if (value == null) {
      throw new Error(`Value not set for ${inputType.name}`)
    }

    return value
  }

  /**
   * Transforms the param type into a flat array structure that can be used to render
   * the inputs of the function fragment. It handles nested structures and
   * arrays and enables you to focus on the rendering logic.
   * @param paramType
   * @param values
   * @param indent
   * @param path
   * @param nameOverride
   * @param extraParams
   * @private
   */
  private transformParamTypeToDisplayData(
    paramType: ParamType,
    values: FragmentDisplayData,
    indent = 0,
    path = '',
    nameOverride = false,
    extraParams = {}
  ) {
    const paramPath = nameOverride ? path : !path ? paramType.name : `${path}.${paramType.name}`

    if (paramType.components) {
      values.push({
        indent,
        index: values.length,
        name: paramType.name,
        baseType: paramType.baseType,
        path: paramPath,
        ...extraParams,
      })

      paramType.components.forEach((componentType, index) => {
        this.transformParamTypeToDisplayData(componentType, values, indent + 1, `${paramPath}.${index}`, true)
      })
      return
    }

    if (paramType.arrayChildren) {
      let generatedCount = this._generatedCounts[paramPath]
      if (isNaN(generatedCount) || generatedCount < 1) {
        generatedCount = 1
      }
      generatedCount = paramType.arrayLength === -1 ? generatedCount : paramType.arrayLength
      this._generatedCounts[paramPath] = generatedCount

      // revert back for dynamic array
      const arrayIndex = values.length
      values.push({
        indent,
        index: arrayIndex,
        name: paramType.name,
        baseType: paramType.baseType,
        length: paramType.arrayLength,
        path: paramPath,
        ...extraParams,
      })

      for (let i = 0; i < generatedCount; i++) {
        this.transformParamTypeToDisplayData(paramType.arrayChildren, values, indent + 1, `${paramPath}.${i}`, true, {
          arrayPath: paramPath,
          arrayIndex: arrayIndex,
          indexInArray: i,
        })
      }
      return
    }

    this.paths.set(paramType, paramPath)
    values.push({
      indent,
      index: values.length,
      name: paramType.name,
      baseType: paramType.baseType,
      path: paramPath,
      ...extraParams,
    })
  }

  /**
   * Deletes the values for the given path and all the sub-paths of the path.
   * @param path
   * @private
   */
  private deleteValuesForPath(path: string) {
    // delete the value for the specific path
    delete this._values[path]

    // delete values for all the sub-paths of the path
    const keys = Object.keys(this._values)
    for (const key of keys) {
      if (key.startsWith(path) + '.') {
        delete this._values[key]
      }
    }
  }

  /**
   * Replaces the values for the given path and all the sub-paths of the path. If the
   * deleteReplaced parameter is true, it deletes the replaced values.
   *
   * @param path
   * @param newPath
   * @param deleteReplaced
   * @private
   */
  private replaceValuesForPath(path: string, newPath: string, deleteReplaced: boolean) {
    // replace the value for the specific path
    this._values[newPath] = this._values[path]
    if (deleteReplaced) {
      delete this._values[path]
    }

    // replace values for all the sub-paths of the path
    const keys = Object.keys(this._values)
    for (const key of keys) {
      if (key.startsWith(path) + '.') {
        const newKey = key.replace(path, newPath)
        this._values[newKey] = this._values[key]
        if (deleteReplaced) {
          delete this._values[key]
        }
      }
    }
  }

  /**
   * Returns the input param at the given sub-path.
   *
   * @param subPath
   * @private
   */
  private getInputParamAtPath(subPath: string): ParamType | null {
    if (!subPath) {
      throw new Error('subPath is required for getInputParam')
    }

    const pathParts = subPath.split('.')
    let current: ParamType | null = null
    for (const part of pathParts) {
      if (!current) {
        current = this._functionFragment.inputs.find((i) => i.name === part) || null
      } else if (current.arrayChildren) {
        current = current.arrayChildren
      } else if (current.components) {
        current = !isNaN(Number(part))
          ? current.components[Number(part)]
          : current.components.find((c) => c.name === part) || null
      }

      if (!current) {
        break
      }
    }

    return current
  }

  /**
   * Modifies the array elements at the given index in the display data. It adds the
   * given count of elements to the array. If the count is negative, it deletes the
   * elements from the end of the array.
   *
   * @param arrayDefinitionIndex
   * @param countToAdd
   * @private
   */
  private modifyArrayElements(arrayDefinitionIndex: number, countToAdd = 1) {
    const arrayDefinition = this._displayData[arrayDefinitionIndex]
    if (!arrayDefinition) {
      throw new Error('Invalid selection for add element')
    }

    if (arrayDefinition.baseType !== 'array' || arrayDefinition.length !== -1) {
      throw new Error('Selected element is not a dynamic array')
    }

    const elementDisplaySegments = []
    const arrayInputParam = this.getInputParamAtPath(arrayDefinition.path)
    if (!arrayInputParam) {
      throw new Error('Invalid array selection')
    }

    const prevGeneratedCount = this._generatedCounts[arrayDefinition.path]
    let generatedCount = countToAdd + prevGeneratedCount

    if (isNaN(generatedCount) || generatedCount < 1) {
      generatedCount = 1
    }
    this._generatedCounts[arrayDefinition.path] = generatedCount

    this.transformParamTypeToDisplayData(
      arrayInputParam,
      elementDisplaySegments,
      arrayDefinition.indent,
      arrayDefinition.path.substring(0, arrayDefinition.path.lastIndexOf('.'))
    )
    const elementsPerItem = (elementDisplaySegments.length - 1) / generatedCount
    for (let i = 0; i < elementDisplaySegments.length; i++) {
      elementDisplaySegments[i].index += arrayDefinitionIndex
      elementDisplaySegments[i].arrayIndex = arrayDefinitionIndex
    }
    this._displayData.splice(arrayDefinitionIndex, 1 + elementsPerItem * prevGeneratedCount, ...elementDisplaySegments)
  }
}
