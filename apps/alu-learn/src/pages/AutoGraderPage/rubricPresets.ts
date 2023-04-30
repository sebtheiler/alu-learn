export const defaultRubric = {
  rows: [
    {
      title: "",
      cols: Array(4).fill([
        {
          description: "",
        },
      ]),
    },
  ],
};

const rubricPresets: RubricPreset[] = [
  {
    name: "None",
    rows: defaultRubric.rows,
  },
  {
    name: "AP World/U.S./European History - LEQ",
    rows: [
      {
        title: "Thesis",
        cols: [
          {
            description:
              "Responds to the prompt with a historically defensible thesis/claim that establishes a line of reasoning",
          },
          { description: "Does not meet the criteria for one point" },
        ],
      },
      {
        title: "Contextualization",
        cols: [
          {
            description:
              "Describes a broader historical context relevant to the prompt",
          },
          { description: "Does not meet the criteria for one point" },
        ],
      },
      {
        title: "Evidence",
        cols: [
          {
            description:
              "Supports an argument in response to the prompt using specific and relevant examples of evidence",
          },
          {
            description:
              "Provides specific examples of evidence relevant to the topic of the prompt",
          },
          { description: "Does not meet the criteria for one point" },
        ],
      },
      {
        title: "Analysis",
        cols: [
          {
            description:
              "Demonstrates a complex understanding of the historical development that is the focus of the prompt, using evidence to corroborate, qualify, or modify an argument that addresses the question",
          },
          {
            description:
              "Uses historical reasoning (e.g., comparison, causation, continuity, and change) to frame or structure an argument that addresses the prompt",
          },
          { description: "Does not meet the criteria for one point" },
        ],
      },
    ],
  },
  {
    name: "AP World/U.S./European History - DBQ",
    rows: [
      {
        title: "Thesis",
        cols: [
          {
            description:
              "Responds to the prompt with a historically defensible thesis/claim that establishes a line of reasoning",
          },
          { description: "Does not meet the criteria for one point" },
        ],
      },
      {
        title: "Contextualization",
        cols: [
          {
            description:
              "Describes a broader historical context relevant to the prompt",
          },
          { description: "Does not meet the criteria for one point" },
        ],
      },
      {
        title: "Evidence",
        cols: [
          {
            description:
              "Supports an argument in response to the prompt using at least six documents",
          },
          {
            description:
              "Uses the content of at least three documents to address the topic of the prompt",
          },
          { description: "Does not meet the criteria for one point" },
        ],
      },
      {
        title: "Outside Evidence",
        cols: [
          {
            description:
              "Uses at least one additional piece of the specific historical evidence (beyond that found in the documents) relevant to an argument about the prompt",
          },
          { description: "Does not meet the criteria for one point" },
        ],
      },
      {
        title: "Analysis",
        cols: [
          {
            description:
              "For at least three documents, explains how or why the document’s point of view, purpose, historical situation, and/or audience is relevant to an argument",
          },
          { description: "Does not meet the criteria for one point" },
        ],
      },
      {
        title: "Complexity",
        cols: [
          {
            description:
              "Demonstrates a complex understanding of the historical development that is the focus of the prompt, using evidence to corroborate, qualify, or modify an argument that addresses the question",
          },
          { description: "Does not meet the criteria for one point" },
        ],
      },
    ],
  },
  {
    name: "AP English Language - Synthesis Essay",
    rows: [
      {
        title: "Thesis",
        cols: [
          {
            description:
              "Responds to the prompt with a thesis that presents a defensible position",
          },
          {
            description:
              "For any of the following: There is no defensible thesis, The intended thesis only restates the prompt, The intended thesis provides a summary of the issue with no apparent or coherent claim, There is a thesis, but it does not respond to the prompt",
          },
        ],
      },
      {
        title: "Evidence",
        cols: [
          {
            description:
              "EVIDENCE: Provides specific evidence from at least three of the provided sources to support all claims in a line of reasoning. AND COMMENTARY: Consistently explains how the evidence supports a line of reasoning",
          },
          {
            description:
              "EVIDENCE: Provides specific evidence from at least three of the provided sources to support all claims in a line of reasoning. AND COMMENTARY: Explains how some of the evidence supports a line of reasoning",
          },
          {
            description:
              "EVIDENCE: Provides evidence from or references at least three of the provided sources. AND COMMENTARY: Explains how some of the evidence relates to the student’s argument, but no line of reasoning is established, or the line of reasoning is faulty",
          },
          {
            description:
              "EVIDENCE: Provides evidence from or references at least two of the provided sources. AND COMMENTARY: Summarizes the evidence but does not explain how the evidence supports the student’s argument",
          },
          {
            description:
              "Simply restates thesis (if present), repeats provided information, or references fewer than two of the provided sources",
          },
        ],
      },
      {
        title: "Sophistication",
        cols: [
          {
            description:
              "Demonstrates sophistication of thought and/or a complex understanding of the rhetorical situation",
          },
          { description: "Does not meet the criteria for one point" },
        ],
      },
    ],
  },
  {
    name: "AP English Language - Rhetorical Analysis",
    rows: [
      {
        title: "Thesis",
        cols: [
          {
            description:
              "Responds to the prompt with a defensible thesis that analyzes the writer’s rhetorical choices",
          },
          {
            description:
              "For any of the following: There is no defensible thesis, The intended thesis only restates the prompt, The intended thesis provides a summary of the issue with no apparent or coherent claim, There is a thesis, but it does not respond to the prompt",
          },
        ],
      },
      {
        title: "Evidence",
        cols: [
          {
            description:
              "EVIDENCE: Provides specific evidence to support all claims in a line of reasoning. AND COMMENTARY: Consistently explains how the evidence supports a line of reasoning. AND Explains how multiple rhetorical choices in the passage contribute to the writer’s argument, purpose, or message",
          },
          {
            description:
              "EVIDENCE: Provides specific evidence to support all claims in a line of reasoning. AND COMMENTARY: Explains how some of the evidence supports a line of reasoning. AND Explains how at least one rhetorical choice in the passage contributes to the writer’s argument, purpose, or message",
          },
          {
            description:
              "EVIDENCE: Provides some specific, relevant evidence. AND COMMENTARY: Explains how some of the evidence relates to the student’s argument, but no line of reasoning is established, or the line of reasoning is faulty",
          },
          {
            description:
              "EVIDENCE: Provides evidence that is mostly general. AND COMMENTARY: Summarizes the evidence but does not explain how the evidence supports the student’s argument. ",
          },
          {
            description:
              "Simply restates thesis (if present), repeats provided information, or offers information irrelevant to the prompt",
          },
        ],
      },
      {
        title: "Sophistication",
        cols: [
          {
            description:
              "Demonstrates sophistication of thought and/or a complex understanding of the rhetorical situation",
          },
          { description: "Does not meet the criteria for one point" },
        ],
      },
    ],
  },
  {
    name: "AP English Language - Argument Essay",
    rows: [
      {
        title: "Thesis",
        cols: [
          {
            description:
              "Responds to the prompt with a thesis that presents a defensible position",
          },
          {
            description:
              "For any of the following: There is no defensible thesis, The intended thesis only restates the prompt, The intended thesis provides a summary of the issue with no apparent or coherent claim, There is a thesis, but it does not respond to the prompt",
          },
        ],
      },
      {
        title: "Evidence",
        cols: [
          {
            description:
              "EVIDENCE: Provides specific evidence from at least three of the provided sources to support all claims in a line of reasoning. AND COMMENTARY: Consistently explains how the evidence supports a line of reasoning",
          },
          {
            description:
              "EVIDENCE: Provides specific evidence from at least three of the provided sources to support all claims in a line of reasoning. AND COMMENTARY: Explains how some of the evidence supports a line of reasoning",
          },
          {
            description:
              "EVIDENCE: Provides evidence from or references at least three of the provided sources. AND COMMENTARY: Explains how some of the evidence relates to the student’s argument, but no line of reasoning is established, or the line of reasoning is faulty",
          },
          {
            description:
              "EVIDENCE: Provides evidence from or references at least two of the provided sources. AND COMMENTARY: Summarizes the evidence but does not explain how the evidence supports the student’s argument",
          },
          {
            description:
              "Simply restates thesis (if present), repeats provided information, or references fewer than two of the provided sources",
          },
        ],
      },
      {
        title: "Sophistication",
        cols: [
          {
            description:
              "Demonstrates sophistication of thought and/or a complex understanding of the rhetorical situation",
          },
          { description: "Does not meet the criteria for one point" },
        ],
      },
    ],
  },
  {
    name: "AP English Literature - Poetry Analysis",
    rows: [
      {
        title: "Thesis",
        cols: [
          {
            description:
              "Responds to the prompt with a thesis that presents a defensible interpretation of the poem",
          },
          {
            description:
              "For any of the following: There is no defensible thesis, The intended thesis only restates the prompt, The intended thesis provides a summary of the issue with no apparent or coherent claim, There is a thesis, but it does not respond to the prompt",
          },
        ],
      },
      {
        title: "Evidence",
        cols: [
          {
            description:
              "Provides specific evidence to support all claims in a line of reasoning. AND Consistently explains how the evidence supports a line of reasoning. AND Explains how multiple literary elements or techniques in the poem contribute to its meaning",
          },
          {
            description:
              "Provides specific evidence to support all claims in a line of reasoning. AND Explains how some of the evidence supports a line of reasoning. AND Explains how at least one literary element or technique in the poem contributes to its meaning",
          },
          {
            description:
              "Provides some specific, relevant evidence. AND Explains how some of the evidence relates to the student’s argument, but no line of reasoning is established, or the line of reasoning is faulty",
          },
          {
            description:
              "Provides evidence that is mostly general. AND Summarizes the evidence but does not explain how the evidence supports the student’s argument",
          },
          {
            description:
              "Simply restates thesis (if present), repeats provided information, or offers information irrelevant to the prompt",
          },
        ],
      },
      {
        title: "Sophistication",
        cols: [
          {
            description:
              "Demonstrates sophistication of thought and/or develops a complex literary argument",
          },
          {
            description: "Does not meet the criteria for one point",
          },
        ],
      },
    ],
  },
  {
    name: "AP English Literature - Prose Fiction Analysis",
    rows: [
      {
        title: "Thesis",
        cols: [
          {
            description:
              "Responds to the prompt with a thesis that presents a defensible interpretation of the passage",
          },
          {
            description:
              "For any of the following: There is no defensible thesis, The intended thesis only restates the prompt, The intended thesis provides a summary of the issue with no apparent or coherent claim, There is a thesis, but it does not respond to the prompt",
          },
        ],
      },
      {
        title: "Evidence",
        cols: [
          {
            description:
              "Provides specific evidence to support all claims in a line of reasoning. AND Consistently explains how the evidence supports a line of reasoning. AND Explains how multiple literary elements or techniques in the passage contribute to its meaning",
          },
          {
            description:
              "Provides specific evidence to support all claims in a line of reasoning. AND Explains how some of the evidence supports a line of reasoning. AND Explains how at least one literary element or technique in the passage contributes to its meaning",
          },
          {
            description:
              "Provides some specific, relevant evidence. AND Explains how some of the evidence relates to the student’s argument, but no line of reasoning is established, or the line of reasoning is faulty",
          },
          {
            description:
              "Provides evidence that is mostly general. AND Summarizes the evidence but does not explain how the evidence supports the student’s argument",
          },
          {
            description:
              "Simply restates thesis (if present), repeats provided information, or offers information irrelevant to the prompt",
          },
        ],
      },
      {
        title: "Sophistication",
        cols: [
          {
            description:
              "Demonstrates sophistication of thought and/or develops a complex literary argument",
          },
          {
            description: "Does not meet the criteria for one point",
          },
        ],
      },
    ],
  },
  {
    name: "AP English Literature - Literary Argument",
    rows: [
      {
        title: "Thesis",
        cols: [
          {
            description:
              "Responds to the prompt with a thesis that presents a defensible interpretation of the selected work",
          },
          {
            description:
              "For any of the following: There is no defensible thesis, The intended thesis only restates the prompt, The intended thesis provides a summary of the issue with no apparent or coherent claim, There is a thesis, but it does not respond to the prompt",
          },
        ],
      },
      {
        title: "Evidence",
        cols: [
          {
            description:
              "Simply restates thesis (if present), repeats provided information, or offers information irrelevant to the prompt",
          },
          {
            description:
              "EVIDENCE: Provides evidence that is mostly general. AND COMMENTARY: Summarizes the evidence but does not explain how the evidence supports the argument",
          },
          {
            description:
              "EVIDENCE: Provides some specific, relevant evidence. AND COMMENTARY: Explains how some of the evidence relates to the student’s argument, but no line of reasoning is established, or the line of reasoning is faulty",
          },
          {
            description:
              "EVIDENCE: Provides specific evidence to support all claims in a line of reasoning. AND COMMENTARY: Explains how some of the evidence supports a line of reasoning",
          },
          {
            description:
              "EVIDENCE: Provides specific evidence to support all claims in a line of reasoning. AND COMMENTARY: Consistently explains how the evidence supports a line of reasoning.",
          },
        ],
      },
      {
        title: "Sophistication",
        cols: [
          {
            description:
              "Demonstrates sophistication of thought and/or develops a complex literary argument",
          },
          {
            description: "Does not meet the criteria for one point",
          },
        ],
      },
    ],
  },
];

export default rubricPresets;

interface RubricPreset extends RubricI {
  name: string;
}

export interface Col {
  description: string;
}

export interface Row {
  title: string;
  cols: Col[];
}

export interface RubricI {
  rows: Row[];
}
