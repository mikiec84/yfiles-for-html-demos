/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
import {
  Class,
  GraphBuilder,
  GraphComponent,
  GraphViewerInputMode,
  HierarchicLayout,
  ICommand,
  LayoutExecutor,
  LayoutOrientation,
  License,
  Size,
  TemplateNodeStyle,
  TreeBuilder
} from 'yfiles'

import TreeBuilderDataJson from './tree-builder-data-json.js'
import TreeBuilderIdDataArray from './tree-builder-id-data-array.js'
import TreeBuilderDataArray from './tree-builder-data-array.js'
import GraphBuilderData from './graph-builder-data.js'
import { bindChangeListener, bindCommand, showApp } from '../../resources/demo-app.js'
import { initDemoStyles } from '../../resources/demo-styles.js'
import loadJson from '../../resources/load-json.js'

/**
 * This demo shows how to automatically build a graph from business data.
 */
function run(licenseData) {
  License.value = licenseData
  // Initialize graph component
  graphComponent = new GraphComponent('graphComponent')

  // Use the viewer input mode since this demo should not allow interactive graph editing
  graphComponent.inputMode = new GraphViewerInputMode()

  // Assign the default demo styles for groups and edges
  initDemoStyles(graphComponent.graph)
  // But use a different style for normal nodes
  graphComponent.graph.nodeDefaults.style = new TemplateNodeStyle('nodeTemplate')
  graphComponent.graph.nodeDefaults.size = new Size(260, 60)

  // Build the graph from data
  builderType = TYPE_GRAPH_BUILDER
  buildGraph()

  // register toolbar commands
  registerCommands()

  showApp(graphComponent)
}

/**
 * The current graph component.
 * @type {GraphComponent}
 */
let graphComponent = null

/**
 * The current builder type.
 * @type {string}
 */
let builderType = null

/**
 * Specifier that indicates using a {@link GraphBuilder}.
 * @type {string}
 */
const TYPE_GRAPH_BUILDER = 'Graph Builder'

/**
 * Specifier that indicates using a {@link TreeBuilder} with an array input.
 * @type {string}
 */
const TYPE_TREE_BUILDER_ARRAY = 'Tree Builder (Array)'

/**
 * Specifier that indicates using a {@link TreeBuilder} with an array input and node IDs.
 * @type {string}
 */
const TYPE_TREE_BUILDER_ID_ARRAY = 'Tree Builder (Array with IDs)'

/**
 * Specifier that indicates using a {@link TreeBuilder} with a JSON input.
 * @type {string}
 */
const TYPE_TREE_BUILDER_JSON = 'Tree Builder (JSON)'

/**
 * Creates and configures the {@link GraphBuilder}.
 * @return {GraphBuilder}
 */
function createGraphBuilder() {
  const graphBuilder = new GraphBuilder(graphComponent.graph)
  // Stores the nodes of the graph
  graphBuilder.nodesSource = GraphBuilderData.nodesSource
  // Stores the edges of the graph
  graphBuilder.edgesSource = GraphBuilderData.edgesSource
  // Stores the group nodes of the graph
  graphBuilder.groupsSource = GraphBuilderData.groupsSource
  // Identifies the property of an edge object that contains the source node's id
  graphBuilder.sourceNodeBinding = 'fromNode'
  // Identifies the property of an edge object that contains the target node's id
  graphBuilder.targetNodeBinding = 'toNode'
  // Identifies the id property of a node object
  graphBuilder.nodeIdBinding = 'id'
  // Identifies the property of a node object that contains its group's id
  graphBuilder.groupBinding = 'group'
  // Identifies the property of a group node object that contains its parent group id
  graphBuilder.parentGroupBinding = 'parentGroup'
  // Identifies the id property of a group node object
  graphBuilder.groupIdBinding = 'id'
  // Identifies the property of an edge object that contains the text used for the edge's label
  graphBuilder.edgeLabelBinding = tag => tag.text || null

  return graphBuilder
}

/**
 * Creates and configures the {@link TreeBuilder}.
 * @return {TreeBuilder}
 */
function createTreeBuilder() {
  const treeBuilder = new TreeBuilder(graphComponent.graph)

  // Set the properties of TreeSource that specify your custom data
  if (builderType === TYPE_TREE_BUILDER_ARRAY) {
    treeBuilder.nodesSource = TreeBuilderDataArray.nodesSource
  } else if (builderType === TYPE_TREE_BUILDER_ID_ARRAY) {
    treeBuilder.nodesSource = TreeBuilderIdDataArray.nodesSource
    // Identifies the ID property of a node
    treeBuilder.idBinding = 'id'
  } else if (builderType === TYPE_TREE_BUILDER_JSON) {
    treeBuilder.nodesSource = TreeBuilderDataJson.nodesSource
  }
  // Identifies the property of a node object that contains its child nodes
  treeBuilder.childBinding = 'children'

  return treeBuilder
}

// We need to load the 'view-layout-bridge' module explicitly to prevent tree-shaking
// tools it from removing this dependency which is needed for 'morphLayout'.
Class.ensure(LayoutExecutor)

/**
 * Builds the graph using the selected builder type.
 * After building the graph, a hierarchic layout is applied.
 */
function buildGraph() {
  // Create the builder
  const builder = builderType === TYPE_GRAPH_BUILDER ? createGraphBuilder() : createTreeBuilder()

  // Build the graph from the data...
  graphComponent.graph = builder.buildGraph()
  // ... and make sure it is centered in the view (this is the initial state of the layout animation)
  graphComponent.fitGraphBounds()

  // Layout the graph with the hierarchic layout style
  const hl = new HierarchicLayout()
  hl.layoutOrientation = LayoutOrientation.LEFT_TO_RIGHT
  graphComponent.morphLayout(hl, '1s')
}

/**
 * Registers the commands for the tool bar buttons during the creation of this application.
 */
function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)
  bindChangeListener("select[data-command='SelectBuilder']", selectedValue => {
    builderType = selectedValue
    // Build graph from new data
    buildGraph()
  })
}

// run the demo
loadJson().then(run)
