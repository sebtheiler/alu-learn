import {
  ControlledTreeEnvironment,
  Tree,
  StaticTreeDataProvider,
  ControlledTreeEnvironmentProps,
  InteractionManager,
  TreeRef,
  TreeItem,
  TreeItemIndex,
} from "react-complex-tree";
import { ClickItemToExpandInteractionManager } from "react-complex-tree/lib/esm/interactionMode/ClickItemToExpandInteractionManager";
import { useRef, useMemo, useContext, useState } from "react";
import IconTooltip from "alu-ui/src/IconTooltip";
import { trpc } from "../../src/app/util";
import { Article, Extract, Topic } from "../../src/generated/client";
import { GlobalContext } from "../../src/app/globalContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretRight,
  faFileLines,
  faFilePdf,
  faFileVideo,
  faFolder,
  faFolderOpen,
  faStickyNote,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import classNames from "helpers-lib/src/classNames";
import getExtractTitle from "../../helpers/getExtractTitle";

const getItemTitle = (item: TreeItem<TreeItemData>) => item.data.title;

type TreeItemData = { title: string } & (
  | {
      type: "root";
    }
  | {
      type: "ARTICLE";
      article: Article;
    }
  | {
      type: "TOPIC";
      topic: Topic;
    }
  | {
      type: "EXTRACT";
      extract: Extract;
    }
);

function createKnowledgeTree({
  articles,
  topics,
  extracts,
}: {
  articles: (Article & {
    childArticles: Article[];
    childTopics: Topic[];
    extracts: Extract[];
  })[];
  topics: (Topic & { childArticles: Article[]; childTopics: Topic[] })[];
  extracts: (Extract & { childExtracts: Extract[] })[];
}) {
  const root: TreeItem<TreeItemData> = {
    index: "root",
    canMove: true,
    isFolder: true,
    children: articles
      .filter((article) => !(article.parentArticleId || article.parentTopicId))
      .map((article) => article.id)
      .concat(
        topics
          .filter((topic) => !(topic.parentArticleId || topic.parentTopicId))
          .map((topic) => topic.id)
      ),
    data: {
      type: "root",
      title: "Root",
    },
    canRename: true,
  };

  const dataStructure = {
    root,
  };

  const basicNode = {
    canvMove: true,
    isFolder: true,
    canRename: true,
  };

  articles.forEach((article) => {
    const node: TreeItem<TreeItemData> = {
      ...basicNode,
      index: article.id,
      data: {
        title: article.title,
        type: "ARTICLE",
        article,
      },
      children: article.childArticles
        .map((childArticle) => childArticle.id)
        .concat(article.childTopics.map((childTopic) => childTopic.id))
        .concat(article.extracts.map((childExtract) => childExtract.id)),
    };

    dataStructure[article.id] = node;
  });

  topics.forEach((topic) => {
    const node: TreeItem<TreeItemData> = {
      ...basicNode,
      index: topic.id,
      data: {
        title: topic.title,
        type: "TOPIC",
        topic,
      },
      children: topic.childArticles
        .map((childArticle) => childArticle.id)
        .concat(topic.childTopics.map((childTopic) => childTopic.id)),
    };

    dataStructure[topic.id] = node;
  });

  extracts.forEach((extract) => {
    const node: TreeItem<TreeItemData> = {
      ...basicNode,
      index: extract.id,
      data: {
        title: getExtractTitle(extract),
        type: "EXTRACT",
        extract,
      },
      children: extract.childExtracts.map((childExtract) => childExtract.id),
    };

    dataStructure[extract.id] = node;
  });

  return dataStructure;
}

const KnowledgeTree: React.FC = () => {
  const utils = trpc.useContext();
  const articles = trpc.article.all.useQuery();
  const topics = trpc.topic.all.useQuery();
  const extracts = trpc.extract.all.useQuery();

  const onSuccess = () => {
    utils.article.all.invalidate();
    utils.topic.all.invalidate();
    utils.extract.all.invalidate();
  };
  const onError = (e: any) => alert(e);

  const rearrangeArticles = trpc.article.rearrange.useMutation({
    onSuccess,
    onError,
  });
  const rearrangeTopics = trpc.topic.rearrange.useMutation({
    onSuccess,
    onError,
  });
  const updateArticle = trpc.article.update.useMutation({ onSuccess, onError });
  const updateTopic = trpc.topic.update.useMutation({ onSuccess, onError });
  const deleteArticle = trpc.article.delete.useMutation({ onSuccess, onError });
  const deleteTopic = trpc.topic.delete.useMutation({ onSuccess, onError });
  const deleteExtract = trpc.extract.delete.useMutation({ onSuccess, onError });

  const { selectedObject, setSelectedObject } = useContext(GlobalContext);

  const knowledgeTree = useMemo(
    () =>
      articles.data && topics.data && extracts.data
        ? createKnowledgeTree({
            articles: articles.data,
            topics: topics.data,
            extracts: extracts.data,
          })
        : undefined,
    [articles, topics, extracts]
  );

  const treeRef = useRef<TreeRef | null>(null);
  const treeEnvironment:
    | Omit<ControlledTreeEnvironmentProps, "children" | "viewState">
    | undefined = useMemo(
    () =>
      knowledgeTree
        ? {
            dataProvider: new StaticTreeDataProvider<TreeItemData>(
              knowledgeTree,
              (item, newName) => ({
                ...item,
                data: {
                  ...item.data,
                  title: newName,
                },
              })
            ),
            getItemTitle,
            items: knowledgeTree,
          }
        : undefined,
    [knowledgeTree]
  );

  const interactionMode: InteractionManager | undefined = useMemo(
    () =>
      treeEnvironment
        ? {
            mode: "custom",
            createInteractiveElementProps: (
              item,
              treeId,
              actions,
              renderFlags
            ) => ({
              ...new ClickItemToExpandInteractionManager(
                treeEnvironment as any
              ).createInteractiveElementProps(
                item,
                treeId,
                actions,
                renderFlags
              ),
              onDoubleClick: () => {
                actions.focusItem();
                actions.selectItem();
                treeRef?.current?.startRenamingItem(item.index);
              },
            }),
          }
        : undefined,
    [treeEnvironment]
  );

  const [focusedItem, setFocusedItem] = useState<TreeItemIndex | undefined>();
  const [expandedItems, setExpandedItems] = useState<TreeItemIndex[]>([]);
  const [selectedItems, setSelectedItems] = useState<TreeItemIndex[]>([]);

  return (
    <div>
      <h2 className="text-2xl font-bold">Knowledge Tree</h2>
      {knowledgeTree && interactionMode && (
        <ControlledTreeEnvironment
          {...treeEnvironment}
          viewState={{
            ["tree-1"]: {
              focusedItem,
              expandedItems,
              selectedItems,
            },
          }}
          defaultInteractionMode={interactionMode}
          canDragAndDrop
          canReorderItems
          canDropOnFolder
          getItemTitle={getItemTitle}
          items={knowledgeTree}
          onFocusItem={(item) => {
            setFocusedItem(item.index);
            if (item.data.type === "ARTICLE")
              setSelectedObject({
                objectType: "ARTICLE",
                id: item.index as string,
              });
            else if (item.data.type === "EXTRACT")
              setSelectedObject({
                objectType: "EXTRACT",
                id: item.index as string,
              });
          }}
          onExpandItem={(item) =>
            setExpandedItems([...expandedItems, item.index])
          }
          onCollapseItem={(item) =>
            setExpandedItems(
              expandedItems.filter(
                (expandedItemIndex) => expandedItemIndex !== item.index
              )
            )
          }
          onSelectItems={(items) => setSelectedItems(items)}
          onDrop={(items, target) => {
            const rearrangedArticles = items.filter(
              (item) => item.data.type === "ARTICLE"
            );
            const rearrangedTopics = items.filter(
              (item) => item.data.type === "TOPIC"
            );
            let targetArticleId: string | null = null;
            let targetTopicId: string | null = null;
            if (target.targetType === "item") {
              const targetType = knowledgeTree[target.targetItem].data.type;
              switch (targetType) {
                case "ARTICLE":
                  targetArticleId = target.targetItem as string;
                  break;
                case "TOPIC":
                  targetTopicId = target.targetItem as string;
                  break;
                default:
                  console.error(`Invalid target type ${targetType}`);
              }
            } else if (target.targetType === "between-items") {
              const targetType = knowledgeTree[target.parentItem].data.type;
              switch (targetType) {
                case "ARTICLE":
                  targetArticleId = target.parentItem as string;
                  break;
                case "TOPIC":
                  targetTopicId = target.parentItem as string;
                  break;
                case "root":
                  break;
                default:
                  console.error(`Invalid target type ${targetType}`);
              }
            }

            rearrangeArticles.mutate({
              rearrangedArticleIds: rearrangedArticles.map(
                (item) => item.index as string
              ),
              targetArticleId,
              targetTopicId,
            });
            rearrangeTopics.mutate({
              rearrangedTopicIds: rearrangedTopics.map(
                (item) => item.index as string
              ),
              targetArticleId,
              targetTopicId,
            });
          }}
          onRenameItem={(item, newName) => {
            switch (item.data.type) {
              case "ARTICLE":
                updateArticle.mutate({
                  id: item.index as string,
                  title: newName,
                });
                break;
              case "TOPIC":
                updateTopic.mutate({
                  id: item.index as string,
                  title: newName,
                });
            }
          }}
          renderItemTitle={({ title }) => <span>{title}</span>}
          renderItemArrow={({ item, context }) => (
            <span>
              <FontAwesomeIcon
                icon={faCaretRight}
                className={classNames(
                  "transition text-gray-500 mr-1",
                  context.isExpanded && "rotate-90"
                )}
              />
              {item.data.type === "ARTICLE" && (
                <FontAwesomeIcon
                  icon={
                    item.data.article.type === "ONLINE_VIDEO"
                      ? faFileVideo
                      : item.data.article.type === "PDF"
                      ? faFilePdf
                      : faFileLines
                  }
                  className="text-green-500 mr-1"
                />
              )}
              {item.data.type === "TOPIC" && (
                <FontAwesomeIcon
                  icon={context.isExpanded ? faFolderOpen : faFolder}
                  className="text-blue-500 mr-1"
                />
              )}
              {item.data.type === "EXTRACT" && (
                <FontAwesomeIcon
                  icon={faStickyNote}
                  className="text-orange-500 mr-1"
                />
              )}
            </span>
          )}
          renderItem={(props) => (
            <li
              {...props.context.itemContainerWithChildrenProps}
              className={classNames(
                props.context.isDraggingOver && "bg-gray-300"
              )}
              style={{ marginLeft: `${props.depth * 12}px` }}
            >
              <div
                {...props.context.itemContainerWithoutChildrenProps}
                {...props.context.interactiveElementProps}
                className="w-full group"
              >
                {props.arrow}
                {props.title}
                <span className="float-right hidden group-hover:inline">
                  <IconTooltip
                    faIcon={faTrash}
                    onClick={(e) => {
                      e.stopPropagation(); // don't open/select the item
                      if (
                        window.confirm(
                          `Are you sure you want to delete "${props.item.data.title}" and all its children?`
                        )
                      ) {
                        switch (props.item.data.type) {
                          case "ARTICLE":
                            deleteArticle.mutate(props.item.index as string);
                            if (
                              props.item.data.article.id === selectedObject?.id
                            )
                              setSelectedObject(null);
                            break;
                          case "TOPIC":
                            deleteTopic.mutate(props.item.index as string);
                            break;
                          case "EXTRACT":
                            deleteExtract.mutate(props.item.index as string);
                            if (
                              props.item.data.extract.id === selectedObject?.id
                            )
                              setSelectedObject(null);
                            break;
                        }
                      }
                    }}
                    tooltip="Delete"
                    className="text-gray-500"
                  />
                </span>
              </div>
              <div
                style={
                  props.context.isExpanded
                    ? {
                        height: "auto",
                        overflowY: "visible",
                        transition: "none 0s ease 0s",
                      }
                    : {}
                }
              >
                {props.children}
              </div>
            </li>
          )}
          renderRenameInput={({ inputProps, inputRef, formProps }) => (
            <form
              {...formProps}
              className="rct-tree-item-renaming-form inline-flex"
            >
              <input
                {...inputProps}
                ref={inputRef}
                className="rct-tree-item-renaming-input"
              />
            </form>
          )}
        >
          <Tree
            treeId="tree-1"
            rootItem="root"
            treeLabel="Knowledge Tree"
            ref={treeRef}
          />
        </ControlledTreeEnvironment>
      )}
      {articles.data?.length === 0 && (
        <p>Your knowledge tree is empty. Import an article to get started.</p>
      )}
    </div>
  );
};

export default KnowledgeTree;
