import React, { useState, useMemo } from 'react';
import {Button, ButtonGroup, Form} from 'react-bootstrap';
import {Slate, ReactEditor} from 'slate-react';
import {Transforms} from 'slate';
import {createFullEditor, EditorButtons, FullEditor} from '../editor-components';
import {insertElement} from './inserter';

const emptyValue = [
  {
    "type": "paragraph",
    "children": [
      {
        "text": ""
      },
    ],
  },
];

const initialValue = [
  {
    "type": "heading-one",
    "children": [
      {
        "text": "Margaret Floy Washburn"
      }
    ]
  },
  {
    "type": "paragraph",
    "children": [
      {
        "text": "Known for:"
      }
    ]
  },
  {
    "type": "bulleted-list",
    "children": [
      {
        "type": "list-item",
        "children": [
          {
            "text": "experimental work in animal behavior"
          }
        ]
      },
      {
        "type": "list-item",
        "children": [
          {
            "text": "motor theory development"
          }
        ]
      },
      {
        "type": "list-item",
        "children": [
          {
            "text": "first woman to be granted psychology PhD"
          }
        ]
      }
    ]
  },
  {
    "type": "heading-two",
    "children": [
      {
        "text": "Biography"
      }
    ]
  },
  {
    "type": "paragraph",
    "children": [
      {
        "text": "Raised in Harlem by rich New York family"
      }
    ]
  },
  {
    "type": "paragraph",
    "children": [
      {
        "text": "Learned to read early and advanced school quickly"
      }
    ]
  }
]

const parseText = (text, version='paragraph') => {
  switch (version) {
    case 'paragraph':
      return text.split('\n');
    case 'sentence':
      const periodCleanFunction = (str) => {
        return str.replace('Ph.D.', 'PhD').replace('PhD.', 'PhD').replace('Ph.D', 'PhD')
        .replace('Mr.', 'Mr').replace('Ms.', 'Ms').replace('Mrs.', 'Mrs')
        .replace('U.S.A.', 'USA').replace('U.S.', 'US');
      };
      const splitByPar = periodCleanFunction(text).split('\n').filter(par => par && par.length > 3);
      const numSentences = 3;
      let finalText = [];

      for (const par of splitByPar) {
        // If there is no period, we assume it is a header
        let toPush;
        if (par.includes('.') === false) {
          toPush = `<h4>${par}</h4>`;
          finalText.push(toPush);
        } else {
          const splitPar = par.split(/\.[^a-zA-Z`_]*?\s/gm); // breaks on '. ' and '.[xx] '
          if (splitPar.length > numSentences) {
            // If it is a long paragraph, we will split it
            // into sentences determined by `numSentences`
            const numConcatSentences = Math.ceil(splitPar.length / numSentences);
            for (let i = 0; i < numConcatSentences; i++) {
              toPush = splitPar.slice(i*numConcatSentences, (i+1)*numConcatSentences).join('. ');
              finalText.push(toPush + (toPush.endsWith('.') ? '' : '.'));
            };
          } else {
            toPush = par;
            finalText.push(toPush);
          };
        };
      };

      return finalText;
    default:
      return;
  };
};

window.onbeforeunload = function() {
  return "Data will be lost if you leave the page, are you sure?";
};

const text = parseText(`
Margaret Floy Washburn[1] (July 25, 1871 – October 29, 1939), leading American psychologist in the early 20th century, was best known for her experimental work in animal behavior and motor theory development. She was the first woman to be granted a PhD in psychology (1894), and the second woman, after Mary Whiton Calkins, to serve as an APA President (1921).[1] A Review of General Psychology survey, published in 2002, ranked Washburn as the 88th most cited psychologist of the 20th century, tied with John Garcia, James J. Gibson, David Rumelhart, Louis Leon Thurstone, and Robert S. Woodworth.[2]
Biography[edit]

Born July 25, 1871 in New York City, she was raised in Harlem by her father Francis, an Episcopal priest, and her mother, Elizabeth Floy, who came from a prosperous New York family. Her ancestors were of Dutch and English descent and were all in America before 1720.[3] Washburn was an only child; she did not appear to have childhood companions her age and spent much of her time with adults or reading.[3] She learned to read long before she started school; this caused her to advance quickly when she started school at age 7.[3] In school, she learned French and German.[3] When she was eleven years old, she started at public school for the first time.[3] In 1886, she graduated from high school at the age of fifteen, and that fall, she entered Vassar College, Poughkeepsie, New York, as a preparatory student. This preparatory status was due to her lack of Latin and French.[3] During her undergraduate years at Vassar, Washburn developed a strong interest in philosophy through poetry and other literary works. She also became a member of Kappa Alpha Theta sorority, and was first introduced to the field of psychology. After she graduated from Vassar in 1891, Washburn became determined to study under James McKeen Cattell in the newly established psychological laboratory at Columbia University. As Columbia had not yet admitted a woman graduate student, she was admitted only as an auditor. Despite the derogatory feelings toward women gaining education at the time, Cattell treated her as a normal student and became her first mentor.[3] She attended his seminary, lectures, and worked in the laboratory alongside men.[3] At the end of her first year of admission at Columbia, Cattell encouraged her to enter the newly organized Sage School of Philosophy at Cornell University to obtain her Ph.D because this would not have been possible at Columbia as an auditor student.[3] She was accepted in 1891 with a scholarship.[3]

At Cornell, she studied under E. B. Titchener, his first and only major graduate student at that time. Her major was psychology.[3] As a graduate student, she conducted an experimental study of the methods of equivalences in tactual perception, as was suggested by Titchener. After two semesters of experimental study, she subsequently earned her Master's degree in absentia from Vassar College in the late spring of 1893 for that work. During her work on the method of equivalents, Washburn had simultaneously developed the topic for her master’s thesis, which was done on the influence of visual imagery on judgments of tactual distance and direction. In June 1894, she gave her oral presentation, and became the first woman to receive a PhD in psychology (as Mary Calkins had previously been denied her PhD because she was a woman). She was also elected to the newly established American Psychological Association. Her master's dissertation was also sent by Titchener to Wilhelm Wundt, who translated it and published it in his Philosophische Studien in 1895.

Following her graduation, Washburn was offered the Chair of Psychology, Philosophy, and Ethics at Wells College, in Aurora, New York. She accepted the offer and delighted in spending the next six years there. While she was there, she made sure to visit Cornell often to catch up with her friends and work in the laboratories.[3] However, she then grew tired of the place, and sought a change. In the spring of 1900, Washburn received a telegram proposing her the warden's position at the Sage College of Cornell University. She accepted the offer and spent the next two years there. Washburn was then offered an assistant professorship of psychology at the University of Cincinnati in Cincinnati, Ohio. This position also gave her full charge of the psychology department.[3] She took the job, but only remained there for one school year before becoming homesick. While at Cincinnati, she was the only woman on the faculty.

In the spring of 1903, she gladly returned to Vassar College as Associate Professor of Philosophy, where she remained the rest of her life. When she started working there, she became the head of the newly founded psychology department.[3] She treated her students well and in turn they appreciated her as a professor.[3] A large number of her students continued to advance in the field of psychology after graduation.[3] Washburn published many of her students' studies during her career.[3] The students would collect and work with the data while she wrote up and published the experiments.[3] Between the years of 1905 and 1938, she published 68 studies from the Vassar Undergraduate Laboratory.[3] These studies were the largest series of studies from any American university at the time.[3] At one point, her students gifted her with a large sum of money and they wanted her to use the money for leisure.[3] Instead, she used the money as scholarship aids for students in the psychology department.[3]

In 1937, a stroke necessitated her retirement (as Emeritus Professor of Psychology). She never fully recovered and died at her home in Poughkeepsie, New York on October 29, 1939. She never married, choosing instead to devote herself to her career and the care of her parents.[4][5]
Professional career[edit]

Washburn was a major figure in psychology in the United States in the first decades of the 20th century, substantially adding to the development of psychology as a science and a scholarly profession. She translated Wilhelm Wundt's Ethical Systems into English.[3] Washburn used her experimental studies in animal behavior and cognition to present her idea that mental (not just behavioral) events are legitimate and important psychological areas for study in her book, The Animal Mind (1908). This, of course, went against the established doctrine in academic psychology that the mental was not observable and therefore not appropriate for serious scientific investigation.

Besides her experimental work, she read widely and drew on French and German experiments of higher mental processes stating they were intertwined with tentative physical movements. She viewed consciousness as an epiphenomenon of excitation and inhibition of motor discharge. She presented a complete motor theory in Movement and Mental Imagery (1916). During the 1920s she continued to amass experimental data from around the world to buttress her argument. She remained anchored in behaviorist tenets but continued to argue for the mind in this process. She took ideas from all major schools of thought in psychology, behaviorism, structuralism, functionalism, and Gestalt psychology, but rejected the more speculative theories of psychodynamics as being too ephemeral. In current psychology research, echoes of Washburn's insistence that behavior is part of thinking can be seen in dynamic systems approach that Thelen and Smith (1994) use to explain the development of cognition in humans.

Washburn's published writings span thirty-five years and include some 127 articles on many topics including spatial perception, memory, experimental aesthetics, individual differences, animal psychology, emotion and affective consciousness. At various times in her career, she was an editor for the American Journal of Psychology, Psychological Bulletin, Journal of Animal Behavior, Psychological Review, and Journal of Comparative Psychology. From 1909 to 1910 and later from 1925 to 1928 she served as the Representative of Psychology in the Division of Psychology and Anthropology of National Research.[3] She became the 30th president of the American Psychological Association in 1921, an honorific title at that time. Being president of the American Psychological Association was one of her dreams growing up.[3] In 1927, she was elected vice president and chairman of Section 1 (Psychology) of the American Association for the Advancement of Science.[3] In 1929, she was elected to the International Committee of Psychology.[3] Washburn was the first woman psychologist and the second woman scientist to be elected to the National Academy of Sciences in 1931.[6] The same year, she served as a United States Delegate to the International Congress of Psychology in Copenhagen.[3]
Contributions to psychology[edit]
The Animal Mind[edit]

Washburn's best-known work and, arguably, her most significant contribution to psychology was her influential textbook, The Animal Mind: A Textbook of Comparative Psychology. Originally published in 1908, this book compiled research on experimental work in animal psychology. Her range of literature was considerable, resulting in a bibliography of 476 titles in the 1st edition, which eventually grew to 1683 titles by the 4th edition. The Animal Mind covered a range of mental activities, beginning with the senses and perception, including hearing, vision, kinesthetic, and tactual sensation. The books' later chapter focused upon consciousness and higher mental processes. However, the dominant focus of the book is animal behavior.

A noteworthy feature is the diversity of animal species considered. In an era when animal research was dominated by rats, Washburn references, "not fewer than 100 species, including ants, bees, caterpillars, cats, chickens, chubs, clams, cockroaches, cows, crabs, crayfish, dogs, dragonflies, earthworms, elephants, flies, frogs, goldfish, grasshoppers, guinea pigs, horseshoe crabs, jellyfish, lancelets, leeches, mice, minnows, monkeys, pigeons, pike, planarians, potato beetles, raccoons, salamanders, sea anemones, sea-urchins, shrimps, silkworms, snails, spiders, tortoises, wasps, water beetles, and (yes) rats."[7] Indeed, she devotes an entire chapter to the mind of the simplest animal, the amoeba.

Also noteworthy is her introductory chapters, which detailed methods of interpreting the results of animal research. Although she was cautious about attributing anthropomorphic meanings to animal behavior and realized that animal consciousness could never be directly measured, she opposed strict behaviorism's dismissal of consciousness and sought to comprehend as much as possible about animal mental phenomena. She suggested that animal psyches contained mental structures similar to that of humans and therefore suggested animal consciousness is not qualitatively different from human mental life. The greater the similarity in neuroanatomical structure and behavior between animals and humans, the more consciousness could be inferred. In her words:

"Our acquaintance with the mind of animals rests upon the same basis as our acquaintance with the mind of our fellow man: both are derived by inference from observed behavior. The actions of our fellow man resemble our own, and we therefore infer in them like subjective states to ours: the actions of animals resemble ours less completely, but the difference is one of degree, not of kind... We know not where consciousness begins in the animal world. We know where it surely resides—in ourselves; we know where it exists beyond a reasonable doubt—in those animals of structure resembling ours which rapidly adapt themselves to the lessons of experience. Beyond this point, for all we know, it may exist in simpler and simpler forms until we reach the very lowest of living beings."[8]

The Animal Mind went through several additions, in 1917, 1926, and 1936 and remained the standard textbook of comparative psychology for nearly 25 years, although about 80% of the material from the first edition was retained in subsequent editions. Compared to later editions, earlier editions extensively covered anecdotal evidence. A chapter on emotions was added to the 4th edition.[9]
Motor theory[edit]

Washburn's motor theory attempted to find common ground between the structuralist tradition of her mentor, Titchener, which focused exclusively on consciousness and the rising view of behaviorism, which dismissed consciousness in favor of visible actions. Washburn's motor theory argued that all thought can be traced back to bodily movements. According to her theory, consciousness arises when a motion or a tendency towards movement is partially inhibited by a tendency towards another movement. In the presence of an object, the senses create an impression of it, including vision, sight, feel etc. This is accompanied by an incipient sense of movement, either towards or from the object. Different objects evoke different senses of motor readiness. When the object is not present, memory re-evokes those sensations. Learning consists of an association of movements into a set of regular series and combinations. When two movements become closely linked in quick succession, the sense of movement from the first primes the next, beginning a series. Ideas are organized the same way. Thinking becomes a derivative of movements of the hands, eyes, vocal cords, and trunk muscles (remember the thinker's pose). In summary:

"While consciousness exists and is not a form of movement, it has as its indispensable basis certain motor processes, and… the only sense in which we can explain conscious processes is by studying the laws governing these underlying motor phenomena".[10]'

Washburn presented this theory in several of her major works, including her early papers and in chapters she contributed to several collections, including Feelings and Emotions: The Wittenberg Symposium and Psychologies of 1930.[11] However, it was most clearly outlined in what she considered her greatest work, Movement and Mental Imagery: Outlines of a Motor Theory of the Complexer Mental Processes.[12] 
`.trim(), 'sentence');

export function AutoNote(props) {
  const [selectedPar, setSelectedPar] = useState(0);
  const [finished, setFinished] = useState(false);
  const [noteDocument, setNoteDocument] = useState(initialValue);
  const [showCompiledNotes, setShowCompiledNotes] = useState(false);

  const [value, setValue] = useState(emptyValue);
  const editor = useMemo(
    () => createFullEditor(),
    []
  );
  const noteEditor = useMemo(
    () => createFullEditor(),
    []
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;

    console.log(selectedPar, noteDocument);
    // Add the new notes to the document
    if (value !== emptyValue) {
      try {
        const newDocument = insertElement(
          value,
          noteDocument,
          form.elements.sectionTitle.value,
        );
        setNoteDocument(newDocument);

        // Move the cursor to the beginning to avoid crash
        Transforms.move(editor, { edge: 'anchor', distance: 9999999, reverse: true });
        Transforms.move(editor, { edge: 'focus', distance: 9999999, reverse: true });
        ReactEditor.focus(editor);
    
        // Clear editor
        setValue(emptyValue);
    
        // Move selected paragraph
        if (selectedPar < text.length - 1) {
          setSelectedPar(selectedPar + 1);
        } else {
          setFinished(true);
        };
      } catch (e) {
        console.log(noteDocument);
        alert(`Something "${e}" went wrong inserting your new note.  Please save now.`);
      };
    };
  };

  return (<div className='container mt-5'>
    <h3 className='text-center'>Content</h3>
    <div style={{ border: '1px solid gray', padding: '30px', height: '250px', overflow: 'hidden', borderRadius: '5px' }}>
      {selectedPar !== 0 &&
        <p style={{ color: '#e0e0e0' }} dangerouslySetInnerHTML={{__html:
          `...${text[selectedPar - 1] && text[selectedPar - 1].substr(text[selectedPar - 1].length - 150, text[selectedPar - 1].length)}`
        }} />
      }
      <p style={{ color: '#000000' }} dangerouslySetInnerHTML={{__html: text[selectedPar]}} />
      {selectedPar !== text.length - 1 &&
        <p style={{ color: '#e0e0e0' }} dangerouslySetInnerHTML={{__html:
          `${text[selectedPar + 1] && text[selectedPar + 1].substr(0, 150)}...`
        }} />
      }
    </div>
    <ButtonGroup className='mt-1 float-right'>
      <Button
        variant='secondary'
        disabled={selectedPar === 0}
        onClick={event => {event.preventDefault(); setSelectedPar(selectedPar - 1);}}
      >Go Back</Button>
      <Button
        variant='secondary'
        onClick={event => {event.preventDefault(); setShowCompiledNotes(!showCompiledNotes);}}
        className='ml-1'
      >{showCompiledNotes ? 'Hide' : 'Show'} Compiled Notes</Button>
    </ButtonGroup>
    {!finished && <>
      <Form onSubmit={handleSubmit} className='mt-4'>
        <Form.Group className='w-75 mx-auto'>
          <Form.Label as='h3'>Section (subsection with "&gt;")</Form.Label>
          <Form.Control
            type='text'
            name='sectionTitle'
            placeholder='B.F. Skinner > Skinner Box'
            required
          />
        </Form.Group>
        <Form.Group>
          <Form.Label as='h3'>Notes</Form.Label>
          <div style={{ borderStyle: 'solid', borderWidth: '1px', paddingTop: '5px', paddingLeft: '5px' }}>
            <Slate
              editor={editor}
              value={value}
              onChange={newValue => {
                setValue(newValue);
              }}
            >
              <EditorButtons
                editor={editor}
              />
              <FullEditor
                editor={editor}
                styleOptions={{ minHeight: '200px' }}
              />
            </Slate>
          </div>
        </Form.Group>
        <Button type='submit' block>Add Notes</Button>
      </Form>
      </>}
      {(finished || showCompiledNotes) && 
        <div className='my-5'>
          <h3 className='text-center'>Here are the notes you{finished ? ' took' : '\'ve taken'} for this paper:</h3>
          <Slate
            editor={noteEditor}
            value={noteDocument}
            onChange={newValue => setNoteDocument(newValue)}
          >
            <FullEditor
              editor={noteEditor}
              readOnly={true}
            />
          </Slate>
        </div>
      }
  </div>);
};