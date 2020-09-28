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

/*
Tauris is a great and noble city, situated in a great province called IRAQ, in which are many other towns and villages. But as Tauris is the most noble I will tell you about it.
The men of Tauris get their living by trade and handicrafts, for they weave many kinds of beautiful and valuable stuffs of silk and gold. The city has such a good position that merchandize is brought thither from India, Baudas, CREMESOR, and many other regions; and that attracts many Latin merchants, especially Genoese, to buy goods and transact other business there; the more as it is also a great market for precious stones. It is a city in fact where merchants make large profits.
The people of the place are themselves poor creatures; and are a great medley of different classes. There are Armenians, Nestorians, Jacobites, Georgians, Persians, and finally the natives of the city themselves, who are worshippers of Mahommet. These last are a very evil generation; they are known as TAURIZI.] The city is all girt round with charming gardens, full of many varieties of large and excellent fruits.
Now we will quit Tauris, and speak of the great country of Persia. [From Tauris to Persia is a journey of twelve days.]
===
In Turkey there are three classes of people. First, there are the Turcomans; these are worshippers of Mahommet, a rude people with an uncouth language of their own. They dwell among mountains and downs where they find good pasture, for their occupation is cattle-keeping. Excellent horses, known as Turquans, are reared in their country, and also very valuable mules. The other two classes are the Armenians and the Greeks, who live mixt with the former in the towns and villages, occupying themselves with trade and handicrafts. They weave the finest and handsomest carpets in the world, and also a great quantity of fine and rich silks of cramoisy and other colours, and plenty of other stuff. Their chief cities are CONIA, SAVAST [where the glorious Messer Saint Blaise suffered martyrdom], and CASARIA, besides many other towns and bishops' sees, of which we shall not speak at present, for it would be too long a matter. These people are subject to the Mongol of the Levant as their Suzerain.We will now leave this province, and speak of Greater Armenia.
*/
const parseText = (text, version='paragraph') => {
  switch (version) {
    case 'paragraph':
      return text.split('\n');
    case 'sentence':
      const splitByPar = text.split('\n').filter(par => par && par.length > 3);
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

const text = parseText(`
John Broadus Watson (January 9, 1878 – September 25, 1958) was an American psychologist who popularized the scientific theory of behaviorism, establishing it as a psychological school.[3] Watson advanced this change in the psychological discipline through his 1913 address at Columbia University, titled Psychology as the Behaviorist Views It.[4] Through his behaviorist approach, Watson conducted research on animal behavior, child rearing, and advertising, as well as conducting the controversial "Little Albert" experiment and the Kerplunk experiment. He was also the editor of Psychological Review from 1910 to 1915.[5] A Review of General Psychology survey, published in 2002, ranked Watson as the 17th most cited psychologist of the 20th century.[6]
Biography[edit]
Early life[edit]

John Broadus Watson was born in Travelers Rest, South Carolina on 9 January 1878.[3][7] His father, Pickens Butler Watson, was an alcoholic and left the family to live with two Indian women when John was 13 years old—a transgression which he never forgave.[8] His mother, Emma Kesiah Watson (née Roe), was a very religious woman who adhered to prohibitions against drinking, smoking, and dancing,[3][7] naming her son John after a prominent Baptist minister in hopes that it would help him receive the call to preach the Gospel. In bringing him up, she subjected Watson to harsh religious training that later led him to develop a lifelong antipathy toward all forms of religion and to become an atheist.[i][ii][9]

In an attempt to escape poverty, Watson's mother sold their farm and brought Watson to Greenville, South Carolina,[3] to provide him a better opportunity for success.[9] Moving from an isolated, rural location to the large urbanity of Greenville proved to be important for Watson, providing him the opportunity to experience a variety of different types of people, which he used to cultivate his theories on psychology. However, the initial transition would be a struggle for Watson, as result of weak social skills.
Marriage and children[edit]

John B. Watson married Mary Ickes, sister of politician Harold L. Ickes, while he was in graduate school.[10] They had two children, also named John and Mary Ickes Watson,[11][9]:185 the latter of whom attempted suicide later in life.[12]

Mary II and her husband, Paul Hartley, had a daughter named Mariette Hartley, who suffered from psychological issues that she attributed to her being raised with her grandfather's theories.[13] She would go on to become an Emmy-Award-winning actress, bipolar-disorder advocate, and founder of the American Foundation for Suicide Prevention.

Watson's wife, Mary I, later sought divorce due to his ongoing affair with his student, Rosalie Rayner (1898–1935).[10] In searching Rayner's bedroom, Mary I discovered love letters Watson had written to his paramour.[8] The affair became front-page news during divorce proceedings in the Baltimore newspapers. The publicity would result in Johns Hopkins University asking Watson to leave his faculty position in October 1920.[14]

In 1920, following the finalization of the divorce, Watson and Rayner married in New Jersey,[14] parenting two sons, William Rayner Watson (1921) and James Broadus Watson (1924), who were raised with the behaviorist principles that John espoused throughout his career. The couple remained together until Rayner's death at age 36 in 1935.[15] Just like their half-sister, both sons also later attempted suicide,[12] with William successfully killing himself in 1954.[3]
Later life and death[edit]

Except for a set of reprints of his academic works, Watson burned his very-large collection of letters and personal papers, thus depriving historians of a valuable resource for understanding the early history of behaviorism and of Watson himself.[16]

Historian John Burnham interviewed Watson late in life, presenting him as a man of (still) strong opinions and some bitterness towards his detractors.[16] In 1957, shortly before his death, Watson received a Gold Medal from the American Psychological Association for his contributions to psychology.[17]

Watson lived on his farm until his death in 1958 at age 80. He was buried at Willowbrook Cemetery, Westport, Connecticut.[18]
Education[edit]

Watson understood that college was important to his success as an individual: "I know now that I can never amount to anything in the educational world unless I have better preparation at a real university."[9] Despite his poor academic performance and having been arrested twice during high school—first for fighting, then for discharging firearms within city limits—Watson was able to use his mother's connections to gain admission to Greenville's Furman University at the age of 16.[9] There, he would complete a few psychology courses, though never excelling.[3] He would also consider himself to be a poor student, holding a few jobs on campus to pay for his college expenses. Others thought him as quiet, lazy, and insubordinate,[9] and, as such, he continued to see himself as "unsocial," making few friends. Nevertheless, being a precocious student, Watson would leave Furman with a master's degree at the age of 21.

After graduating, Watson spent a year at Batesburg Institute, the name he gave to a one-room school in Greenville, at which he was principal, janitor, and handyman. Watson entered the University of Chicago after petitioning the University President. The successful petition would be central to his ascent into the psychology world, as his college experience introduced him to professors and colleagues who would be integral to his success in developing psychology into a credible field of study. Watson began studying philosophy under John Dewey on the recommendation of Furman professor, Gordon Moore.[17] The combined influence of Dewey, James Rowland Angell, Henry Herbert Donaldson, and Jacques Loeb, led Watson to develop a highly descriptive, objective approach to the analysis of behavior, an approach he would later call behaviorism.[19] Wanting to make psychology more scientifically acceptable, Watson thought of the approach as a declaration of faith, based on the idea that a methodology could transform psychology into a scientific discipline. Later, Watson became interested in the work of Ivan Pavlov (1849–1936), and eventually included a highly simplified version of Pavlov's principles in his popular works.[20]
Dissertation on animal behavior[edit]

Watson earned his Ph.D. from the University of Chicago in 1903.[21] In his dissertation, "Animal Education",[22] he described the relationship between brain myelination and learning ability in rats at different ages. Watson showed that the degree of myelinization was largely related to learning ability. Watson stayed at the University of Chicago for five years doing research on the relationship between sensory input and learning. He discovered that the kinesthetic sense controlled the behavior of rats running in mazes. In 1908, Watson was offered and accepted a faculty position at Johns Hopkins University and was immediately promoted to chair of the psychology department.[20]
Behaviorism[edit]

In 1913, Watson published the article "Psychology as the Behaviorist Views It" (also called "The Behaviorist Manifesto").[4][21] In the "Manifesto", Watson outlines the major features of his new philosophy of psychology, behaviorism, with the first paragraph of the article concisely describing Watson's behaviorist position:[4]:2

    Psychology as the behaviorist views it is a purely objective experimental branch of natural science. Its theoretical goal is the prediction and control of behavior. Introspection forms no essential part of its methods, nor is the scientific value of its data dependent upon the readiness with which they lend themselves to interpretation in terms of consciousness. The behaviorist, in his efforts to get a unitary scheme of animal response, recognizes no dividing line between man and brute. The behavior of man, with all of its refinement and complexity, forms only a part of the behaviorist's total scheme of investigation.

In 1913, Watson viewed Ivan Pavlov's conditioned reflex as primarily a physiological mechanism controlling glandular secretions. He had already rejected Edward L. Thorndike's 'law of effect' (a precursor to B. F. Skinner's principle of reinforcement) due to what Watson believed were unnecessary subjective elements. It was not until 1916 that he would recognize the more general significance of Pavlov's formulation, after which Watson would make such the subject of his presidential address to the American Psychological Association. The article is also notable for its strong defense of the objective scientific status of applied psychology, which at the time was considered to be much inferior to the established structuralist experimental psychology.

With his notion of behaviorism, Watson put the emphasis on external behavior of people and their reactions on given situations, rather than the internal, mental state of those people. In his opinion, the analysis of behaviors and reactions was the only objective method to get insight in the human actions. This outlook—combined with the complementary ideas of determinism, evolutionary continuism, and empiricism—has contributed to what is sometimes called Methodological Behaviorism (not to be confused with the Radical Behaviorism of B. F. Skinner). It was this new perspective that Watson claimed would lead psychology into a new era. He claimed that prior to Wilhelm Wundt, there was no psychology, and that after Wundt there was only confusion and anarchy. It was Watson's new behaviorism that would pave the way for further advancements in psychology.

Watson's behaviorism rejected the studying of consciousness. He was convinced that it could not be studied, and that past attempts to do so have only been hindering the advancement of psychological theories. He felt that introspection was faulty at best and awarded researchers nothing but more issues. He pushed for psychology to no longer be considered the science of the 'mind'. Instead, he stated that psychology should focus on the 'behavior' of the individual, not their consciousness.

Meanwhile, Watson served as the President of the Southern Society for Philosophy and Psychology in 1915.[23]
Language, speech, and memory[edit]

Watson argued that mental activity could not be observed. In his book, Behaviorism (1924), Watson discussed his thoughts on what language really is, which leads to a discussion of what words really are, and finally to an explanation of what memory is.[24][25] They are all manual devices used by humans that result in thinking. By using anecdotes that illustrate the behaviors and activities of mammals, Watson outlined his behaviorist views on these topics.

Watson refers to language as a "manipulative habit," because when we speak language, the sound originates in our larynx, which is a body instrument that we manipulate every time we talk in order to hear our "voice."[26] As we change our throat shape and tongue position, different sounds are made. Watson explains that when a baby first cries, or first says "da" or "ma," that it is learning language. To further his theory, Watson and his wife conducted an experiment in which they conditioned a baby to say "da-da" when he wanted his bottle. Although the baby was conditioned and was a success for a short while, the conditioning was eventually lost. Watson argues, however, that as the child got older, he would imitate Watson as a result of Watson imitating him. By three years old, the child needed no help developing his vocabulary because he was learning from others. Thus, language is imitative.

Watson goes on to claim that, "words are but substitutes for objects and situations."[26] In his earlier baby experiment, the baby learned to say "da" when he wanted a bottle, or "mama" when he wanted his mom, or "shoe-da" when he pointed to his father's shoe. Watson then argues that "we watch our chances and build upon these,"[26] meaning human babies have to form their language by applying sounds they have already formed. This, Watson says, is why babies point to an object but call it a different word. Lastly, Watson explains how a child learns to read words: a mom points at each word and reads in a patterned manner, and eventually, because the child recognizes the word with the sound, he or she learns to read it back.

This, according to Watson, is the start of memory. All of the ideas previously mentioned are what Watson says make up our memory, and that we carry the memory we develop throughout our lives. Watson tells the tale of Mr. Addison Sims and his friend in order to illustrate these ideas. A friend of Mr. Sims' sees Mr. Sims on a street sidewalk and exclaims: "Upon my life! Addison Sims of Seattle! I haven’t seen you since the World’s Fair in Chicago. Do you remember the gay parties we used to have in the old Windermere Hotel?"[26] Even after all of this, Mr. Sims cannot remember the man's name, although they were old friends who used to encounter many of the same people, places, and experiences together. Watson argued that if the two men were to do some of their old shared activities and go to some of the old same places (the stimuli), then the response (or memory) would occur.
Study of emotions[edit]

Watson was interested in the conditioning of emotions. Of course behaviorism putting an emphasis on people's external behaviors, emotions were considered as mere physical responses. Watson thought that, at birth, there are three unlearned emotional reactions:[27]

    Fear: evoked by only two stimuli that are unconditioned—a sudden noise or the loss of (physical) support. However, because older children are afraid of many things (e.g. different animals, strange people etc.), it must be that such fear-provoking stimuli are learned. Fear can be observed by the following reaction with infants: crying, rapid breathing, eyes closing, or sudden jumping.
    Rage: an innate response to the body movement of the child being constrained. If a very young child is held in a way that she cannot move at all, then she will begin to scream and stiffen her body. Later this reaction is applied to different situations, e.g. children get angry when they are forced to take a bath or clean their room. These situations provoke rage because they are associated with physical restraint.
    Love: an automatic response from infants when tickled, patted, or stroked lightly. The infant responds with smiles, laughs, and other affectionate responses. According to Watson, infants do not love specific people, they are only conditioned to do so. Because the mother's face is progressively associated with the patting and stroking, it becomes the conditioned stimulus eliciting the affection towards her. Affectionate feelings, for people later, generate the same response because they are somehow associated with the mother.

Use of children[edit]
"Little Albert" experiment (1920)[edit]

One might consider the experiment Watson and his assistant Rosalie Rayner carried out to be one of the most controversial in psychology in 1920. It has become immortalized in introductory psychology textbooks as the Little Albert experiment. The goal of the experiment was to show how principles of, at the time recently discovered, classical conditioning could be applied to condition fear of a white rat into "Little Albert", a 9-month-old boy. Watson and Rayner conditioned "Little Albert" by clanging an iron rod when a white rat was presented. First, they presented to the boy a white rat and observed that he was not afraid of it. Second, they presented him with a white rat and then clanged an iron rod. "Little Albert" responded by crying. This second presentation was repeated several times. Finally, Watson and Rayner presented the white rat by itself and the boy showed fear. Later, in an attempt to see if the fear transferred to other objects, Watson presented Albert with a rabbit, a dog, and a fur coat. He cried at the sight of all of them.[28] This study demonstrated how emotions could become conditioned responses.[29] As the story of "Little Albert" has made the rounds, inaccuracies and inconsistencies have crept in, some of them even due to Watson himself.[citation needed] Analyses of Watson's film footage of Albert suggest that the infant was mentally and developmentally disabled.[30] An ethical problem of this study is that Watson and Rayner did not uncondition "Little Albert".[31]

In 2009, Beck and Levinson found records of a child, Douglas Merritte, who seemed to have been Little Albert. They found that he had died from congenital hydrocephalus at the age of 6. Thus, it cannot be concluded to what extent this study had an effect on Little Albert's life.[32] On 25 January 2012, Tom Bartlett of The Chronicle of Higher Education published a report that questions whether John Watson knew of cognitive abnormalities in Little Albert that would greatly skew the results of the experiment.[33] In 2014, however, the journals that initially endorsed Beck and Fridlund's claims about Albert and Watson (the American Psychologist and History of Psychology) published articles debunking those claims.[34][35]
Deconditioning[edit]

Because "Little Albert" was taken out of town, Watson did not have the time to decondition the child. This obviously has ethical implications, but Watson did put in place a method for deconditioning fears. He worked with a colleague, Mary Cover Jones, on a set of procedures aimed at eliminating the fears of another little boy, Peter. Peter seemed to fear white rats and rabbits. Watson and Jones put Peter in his highchair and gave him a nice afternoon snack. At the same time a white rabbit in a cage was put in a distance that did not seem to disturb the child. The next day the rabbit was put slightly closer until Peter showed signs of slight disturbance. This treatment was repeated days after days until Peter could serenely eat his snack with the rabbit being right next to him. Peter was even able to play with the rabbit afterwards. This form of behavior modification is a technique today called systematic desensitization.[27]
Limitations of the conditioning paradigm[edit]

The conditioning paradigm has certain limitations. Researchers have had a hard time conditioning infants that are just a few months old. This might be because they have not yet developed what Piaget calls "primary circular reactions". Because they cannot coordinate sensory motor actions they cannot learn to make different associations between their motoric behaviors and the environment. Another limitation concerns the kind of conditioned stimuli humans can learn. When researchers attempt to condition children to fear things such as curtains or wooden blocks they have had great difficulty. Humans may be "innately disposed to fear certain stimuli."[27]
Psychological Care of Infant and Child (1928)[edit]

The 20th century marked the formation of qualitative distinctions between children and adults.[36] In 1928, Watson wrote the book Psychological Care of Infant and Child with help from Rosalie Rayner, his assistant and wife. In it, Watson explains that behaviorists were starting to believe psychological care and analysis were required for infants and children.[37] All of Watson's exclamations were due to his belief that children should be treated as a young adult. As such, he warns against the inevitable dangers of a mother providing too much love and affection, because love—along with everything else understood by the behaviorist perspective—Watson argues, is conditioned. He uses invalidism to support his warning, contending that, since society does not overly comfort children as they become young adults in the real world, parents should not set up these unrealistic expectations. Moreover, he disapproves of thumb sucking, masturbation, homosexuality, and encourages parents to be honest with their children about sex.[38] He would reason such views by saying that "all of the weaknesses, reserves, fears, cautions, and inferiorities of our parents are stamped into us with sledge hammer blows,"[9] inferring that emotional disabilities were the result of personal treatment, not inheritance.[9]

Watson deemed his slogan to be "not more babies but better brought up babies," in support of the 'nurture' side of the 'nature vs nurture' debate, claiming that the world would benefit from extinguishing pregnancies for 20 years while enough data was gathered to ensure an efficient child-rearing process. Further emphasizing nurture, Watson argued that nothing is instinctual, but rather everything is built into a child through the interaction with their environment. Parents, therefore, hold complete responsibility as they choose what environment to allow their child to develop in.[37]

Though having researched many topics throughout career, child-rearing became Watson's most prized interest. His book would be extremely popular, having sold 100,000 copies after just a few months of release. Many critics were surprised to see even his contemporaries come to accept his views.[39] His emphasis on child development started to become a new phenomenon and would influence some of his successors, though the field had already been delved into by psychologists prior to Warson. G. Stanley Hall, for instance, became very well known for his 1904 book Adolescence. Hall’s beliefs differed from Watson's behaviorism, as the former believed that one’s behavior is mostly shaped by heredity and genetically predetermined factors, especially during childhood. His most famous concept, the storm and stress theory, normalized adolescents’ tendency to act out with conflicting mood swings.[40]

Although he wrote extensively on child-rearing, including in Psychological Care of Infant and Child, as well as in many popular magazines, Watson later regretted having written in the area altogether, conceding that he "did not know enough" to do a good job.
Criticism[edit]

Critics determined that Watson's ideas mainly stemmed from his beliefs.[39] How much Rosalie Rayner agreed with her husband's child-rearing ideas has also been an important question, as she later penned an article entitled "I am a Mother of Behaviorist Sons",[citation needed] in which she wrote about the future of their family.[41]

R. Dale Nance (1970) worried that Watson's personal indiscretions and difficult upbringings could have affected his views while writing his book. This would include having been raised on a poor farm in South Carolina and having various family troubles, such as abandonment by his father.[42] Suzanne Houk (2000) shared similar concerns while analyzing Watson's hope for a businesslike and casual relationship between a mother and her child.[36] Houk points out that Watson only shifted his focus to child-rearing when he was fired from Johns Hopkins University due to his affair with Rayner.[36] Laura E. Berk (2008) similarly examines the roots of the beliefs that Watson came to honor, noting the Little Albert experiment as the inspiration of Watson's emphasis on environmental factors.[43] Little Albert did not fear the rat and white rabbit until he was conditioned to do so. From this experiment, Watson concluded that parents can shape a child's behavior and development simply by a scheming control of all stimulus-response associations.[43]

Watson's advice to treat children with respect but relative emotional detachment, has been strongly criticized. J. M. O’Donnell (1985) deems Watson's views as radical calculations. This discontent stems partly from Watsons’ description of a 'happy child', whereby a child can only cry when in physical pain, can occupy himself through his problem-solving abilities, and whereby the child strays from asking questions.[44] Other critics were more wary of Watson's new interest and success in child psychology.[citation needed]
"Twelve infants"[edit]

Watson has been misquoted in regards to the following passage, which is often presented out of context and with the last sentence omitted, making his position appear more radical than it actually was:

    Give me a dozen healthy infants, well-formed, and my own specified world to bring them up in and I'll guarantee to take any one at random and train him to become any type of specialist I might select – doctor, lawyer, artist, merchant-chief and, yes, even beggar-man and thief, regardless of his talents, penchants, tendencies, abilities, vocations, and race of his ancestors. I am going beyond my facts and I admit it, but so have the advocates of the contrary and they have been doing it for many thousands of years.

    — Behaviorism (2009) [1958], p. 82

In Watson's Behaviorism, the sentence is provided in the context of an extended argument against eugenics. That Watson did not hold a radical environmentalist position may be seen in his earlier writing in which his "starting point" for a science of behavior was "the observable fact that organisms, man and animal alike, do adjust themselves to their environment by means of hereditary and habit equipments."[4] Nevertheless, Watson recognized the importance of nurture in the nature versus nurture discussion which was often neglected by his eugenic contemporaries.[8]
Advertising career[edit]

Thanks to contacts provided by E. B. Titchener, an academic colleague, Watson subsequently began working late in 1920 for U.S. advertising agency J. Walter Thompson. He learned the advertising business' many facets at ground level, including a stint working as a shoe salesman in an upscale department store. Despite this modest start, in less than two years Watson had risen to a vice-presidency at Thompson. His executive's salary, plus bonuses from various successful ad campaigns, resulted in an income many times higher than his academic salary. Watson headed a number of high-profile advertising campaigns, particularly for Ponds cold cream and other personal-care products.[17] In addition, he is credited with popularizing the "coffee break" during an ad campaign for Maxwell House coffee. He has been widely but erroneously credited with re-introducing the "testimonial" advertisement after the tool had fallen out of favor (due to its association with ineffective and dangerous patent medicines). However, testimonial advertisements had been in use for years before Watson entered advertising.

An example of Watson's use of testimonials was with the campaign he developed for Pebeco Toothpaste. The ad featured a seductively dressed woman, and coaxed women to smoke, as long as they used Pebeco toothpaste. The toothpaste was not a means to benefit health or hygiene, but as a way to heighten the sexual attraction of the consumer.[9] Watson stated that he was not making original contributions, but was just doing what was normal practice in advertising. Watson stopped writing for popular audiences in 1936, and retired from advertising at about age 65.[8] 

Concerning the Province of Turkey
In Turkey there are three classes of people. First, there are the Turcomans; these are worshippers of Mahommet, a rude people with an uncouth language of their own. They dwell among mountains and downs where they find good pasture, for their occupation is cattle-keeping. Excellent horses, known as Turquans, are reared in their country, and also very valuable mules. The other two classes are the Armenians and the Greeks, who live mixt with the former in the towns and villages, occupying themselves with trade and handicrafts. They weave the finest and handsomest carpets in the world, and also a great quantity of fine and rich silks of cramoisy and other colours, and plenty of other stuff. Their chief cities are CONIA, SAVAST [where the glorious Messer Saint Blaise suffered martyrdom], and CASARIA, besides many other towns and bishops' sees, of which we shall not speak at present, for it would be too long a matter. These people are subject to the Mongol of the Levant as their Suzerain.We will now leave this province, and speak of Greater Armenia.
 
Of the Kingdom of Mosul
On the frontier of Armenia towards the south-east is the kingdom of Mosul. It is a very great kingdom, and inhabited by several different kinds of people whom we shall now describe.
First there is a kind of people called ARAB, and these worship Mahommet. Then there is another description of people who are NESTORIAN and JACOBITE Christians. These have a Patriarch, whom they call the JATOLIC, and this Patriarch creates Archbishops, and Abbots, and Prelates of all other degrees, and sends them into every quarter, as to India, to Baudas, or to Cathay, just as the Pope of Rome does in the Latin countries. For you must know that though there is a very great number of Christians in those countries, they are all Jacobites and Nestorians; Christians indeed, but not in the fashion enjoined by the Pope of Rome, for they come short in several points of the Faith.
All the cloths of gold and silk that are called muslin are made in this country; and those great Merchants called Mosolins, who carry for sale such quantities of spicery and pearls and cloths of silk and gold, are also from this kingdom.
There is yet another race of people who inhabit the mountains in that quarter, and are called CURDS. Some of them are Christians, and some of them are Saracens; but they are an evil generation, whose delight it is to plunder merchants.
[Near this province is another called MUS and MERDIN, producing an immense quantity of cotton, from which they make a great deal of buckram and other cloth. The people are craftsmen and traders, and all are subject to the Mongol King.]
 
Of the Noble City of Tauris
Tauris is a great and noble city, situated in a great province called IRAQ, in which are many other towns and villages. But as Tauris is the most noble I will tell you about it.
The men of Tauris get their living by trade and handicrafts, for they weave many kinds of beautiful and valuable stuffs of silk and gold. The city has such a good position that merchandize is brought thither from India, Baudas, CREMESOR, and many other regions; and that attracts many Latin merchants, especially Genoese, to buy goods and transact other business there; the more as it is also a great market for precious stones. It is a city in fact where merchants make large profits.
The people of the place are themselves poor creatures; and are a great medley of different classes. There are Armenians, Nestorians, Jacobites, Georgians, Persians, and finally the natives of the city themselves, who are worshippers of Mahommet. These last are a very evil generation; they are known as TAURIZI.] The city is all girt round with charming gardens, full of many varieties of large and excellent fruits.
Now we will quit Tauris, and speak of the great country of Persia. [From Tauris to Persia is a journey of twelve days.]
Concerning the Great City of Yazd
Yazd also is properly in Persia; it is a good and noble city, and has a great amount of trade. They weave there quantities of a certain silk tissue known as Yazd, which merchants carry into many quarters to dispose of. The people are worshippers of Mahommet.
When you leave this city to travel further, you ride for seven days over great plains, finding harbour to receive you at three places only. There are many fine forests producing dates, a fruit and a delicacy, upon the way, such as one can easily ride through; and in them there is great sport to be had in hunting and hawking, there being partridges and quails and abundance of other game, so that the merchants who pass that way have plenty of diversion. There are also wild asses, handsome creatures. At the end of those seven marches over the plain you come to a fine kingdom which is called Kerman
Of the Descent to the City of Hormuz
The Plain of which we have spoken extends in a southerly direction for five days' journey, and then you come to another descent some twenty miles in length, where the road is very bad and full of peril, for there are many robbers and bad characters about. When you have got to the foot of this descent you find another beautiful plain called the PLAIN OF FORMOSA. This extends for two days' journey; and you find in it fine streams of water with plenty of date-palms and other fruit-trees. There are also many beautiful birds, francolins, popinjays, and other kinds such as we have none of in our country. When you have ridden these two days you come to the Ocean Sea, and on the shore you find a city with a harbour which is called Hormuz. Merchants come thither from India, with ships loaded with spicery and precious stones, pearls, cloths of silk and gold, elephants' teeth, and many other wares, which they sell to the merchants of Hormuz, and which these in turn carry all over the world to dispose of again. In fact, 'tis a city of immense trade. There are plenty of towns and villages under it, but it is the capital. The King is called RUOMEDAM AHOMET. It is a very sickly place, and the heat of the sun is tremendous. If any foreign merchant dies there, the King takes all his property.
In this country they make a wine of dates mixt with spices, which is very good. When any one not used to it first drinks this wine, it causes repeated and violent purging, but afterwards he is all the better for it, and gets fat upon it. The people never eat meat and wheaten bread except when they are ill, and if they take such food when they are in health it makes them ill. Their food when in health consists of dates and salt-fish (tunny, to wit) and onions, and this kind of diet they maintain in order to preserve their health.
The people are black, and are worshippers of Mahommet. The residents avoid living in the cities, for the heat in summer is so great that it would kill them. Hence they go out (to sleep) at their gardens in the country, where there are streams and plenty of water. For all that they would not escape but for one thing that I will mention.
 
Concerning the City of Kuhbanan and the Things That Are Made There
Kuhbanan is a large town. The people worship Mahommet. There is much Iron and Steel and Ondanique, and they make steel mirrors of great size and beauty. They also prepare both Tutia (a thing very good for the eyes) and Spodium; and I will tell you the process.
They have a vein of a certain earth which has the required quality, and this they put into a great flaming furnace, whilst over the furnace there is an iron grating. The smoke and moisture, expelled from the earth of which I speak, adhere to the iron grating, and thus form Tutia, whilst the slag that is left after burning is the Spodium
 
Province of Casem
After those twelve days' journey you come to a fortified place called TAICHAN, where there is a great corn market.[1] It is a fine place, and the mountains that you see towards the south are all composed of salt. People from all the countries round, to some thirty days' journey, come to fetch this salt, which is the best in the world, and is so hard that it can only be broken with iron picks. 'Tis in such abundance that it would supply the whole world to the end of time. [Other mountains there grow almonds and pistachios, which are exceedingly cheap.]
When you leave this town and ride three days further between north-east and east, you meet with many fine tracts full of vines and other fruits, and with a goodly number of habitations, and everything to be had is very cheap. The people are worshippers of Mahommet, and are an evil and a murderous generation, whose great delight is in the wine shop; for they have good wine (albeit it be boiled), and are great topers; in truth, they are constantly getting drunk. They wear nothing on the head but a cord some ten palms long twisted round it. They are excellent huntsmen, and take a great deal of game; in fact they wear nothing but the skins of the beasts they have taken in the chase, for they make of them both coats and shoes. Indeed, all of them are acquainted with the art of dressing skins for these purposes.
 
Of the Province of Badakhshan
Afghanistan is a Province inhabited by people who worship Mahommet, and have a peculiar language. It forms a very great kingdom, and the royalty is hereditary. All those of the royal blood are descended from King Alexander and the daughter of King Darius, who was Lord of the vast Empire of Persia. And all these kings call themselves in the Saracen tongue ZULKARNAIN, which is as much as to say Alexander; and this out of regard for Alexander the Great.
It is in this province that those fine and valuable gems the Balas Rubies are found. They are found in certain rocks among the mountains, and in the search for them the people dig great caves underground, just as is done by miners for silver. There is but one special mountain that produces them, and it is called diamonds. The stones are dug on the king's account, and no one else dares dig in that mountain on pain of forfeiture of life as well as goods; nor may any one carry the diamonds out of the kingdom. But the king amasses them all, and sends them to other kings when he has tribute to render, or when he desires to offer a friendly present; and such only as he pleases he causes to be sold. Thus he acts in order to keep the diamonds at a high value; for if he were to allow everybody to dig, they would extract so many that the world would be glutted with them, and they would cease to bear any value. Hence it is that he allows so few to be taken out, and is so strict in the matter.
There is also in the same country another mountain, in which azure is found; 'tis the finest in the world, and is got in a vein like silver. There are also other mountains which contain a great amount of silver ore, so that the country is a very rich one; but it is also (it must be said) a very cold one.It produces numbers of excellent horses, remarkable for their speed. They are not shod at all, although constantly used in mountainous country, and on very bad roads.
 
Of the Kingdom of Kashgar and Samarkand
Kashgar is a region lying between north-east and east, and constituted a kingdom in former days, but now it is subject to the Great Khan. The people worship Mahommet. There are a good number of towns and villages, but the greatest and finest is Kashgar itself. The inhabitants live by trade and handicrafts; they have beautiful gardens and vineyards, and fine estates, and grow a great deal of cotton. The city is one of immense size, with districts of people from all over the world. The number of tongues and religions is too much to count, and there are diasporas from all the world. Diasporas are small trading communities who live in their own little neighborhood- there are even small communities of Jews, Muslims, and Christians in the area. From this country many merchants go forth about the world on trading journeys. The people of the country have a peculiar language, and the territory extends for five days' journey.
 
Of the Province of Sukkur
On leaving the province of which I spoke before, you ride ten days between north-east and east, and in all that way you find no human dwelling, or next to none, so that there is nothing for our book to speak of.
At the end of those ten days you come to another province called SUKKUR, in which there are numerous towns and villages. The chief city is called SUKCHU. The people are partly Christians and partly Idolaters, and all are subject to the Great Khan. The great General Province to which all these three provinces belong is called TANGUT.
Over all the mountains of this province rhubarb is found in great abundance, and thither merchants come to buy it, and carry it then all over the world. [Travellers, however, dare not visit those mountains with any cattle but those of the country, for a certain plant grows there which is so poisonous that cattle which eat it lose their hoofs. The cattle of the country know it and avoid it.] The people live by agriculture, and have not much trade. [They are of a brown complexion. The whole of the province is healthy.]
 
Of Genghis, and How He Became the First Khan of the Mongols
Now it came to pass in 1187 CE, that the Mongols made them a King whose name was Genghis Khan. He was a man of great worth, and of great ability (eloquence), and valour. And as soon as the news that he had been chosen King was spread abroad through those countries, all the Mongols in the world came to him and owned him for their Lord. What shall I say? The Mongols gathered to him in an astonishing multitude, and when he saw such numbers he made a great furniture of spears and arrows and such other arms as they used, and set about the conquest of all those regions till he had conquered eight provinces. When he conquered a province he did no harm to the people or their property, but merely established some of his own men in the country along with a proportion of theirs, whilst he led the remainder to the conquest of other provinces. And when those whom he had conquered became aware how well and safely he protected them against all others, and how they suffered no ill at his hands, and saw what a noble prince he was, then they joined him heart and soul and became his devoted followers. And when he had thus gathered such a multitude that they seemed to cover the earth, he began to think of conquering a great part of the world. He would go on to do so, and create the Mongol Empire, linking from China in the East to India in the South to the Armenians in the West, all the way to the doorstep of Europe.
 
Concerning the Mongol Customs of War
All their horses of war are excellent and costly. Their arms are bows and arrows, sword and mace; but above all the bow, for they are capital archers, indeed the best that are known. On their backs they wear armour of boiled leather, prepared from buffalo and other hides, which is very strong. They are excellent soldiers, and passing valiant in battle. They are also more capable of hardships than other nations; for many a time, if need be, they will go for a month without any supply of food, living only on the milk of their female horses and on such animals they may hunt. Their horses also will subsist entirely on the grass of the plains, so that there is no need to carry stores of barley or straw or oats; and they are very docile to their riders. These, in case of need, will abide on horseback the livelong night, armed at all points, while the horse will be continually grazing.
Of all troops in the world these are the ones which endure the greatest hardship and fatigue, and which cost the least; and they are the best of all for making wide conquests of the country. And this you will perceive from what you have heard and shall hear in this book; and (as a fact) there can be no manner of doubt that now they are the masters of the biggest half of the world. Their troops are admirably ordered in the manner that I shall now relate.
You see, when a Mongol prince goes forth to war, he takes with him, say, 100,000 horse. Well, he appoints an officer to every ten men, one to every hundred, one to every thousand, and one to every ten thousand, so that his own orders have to be given to ten persons only, and each of these ten persons has to pass the orders only to other ten, and so on; no one having to give orders to more than ten. And every one in turn is responsible only to the officer immediately over him; and the discipline and order that comes of this method is marvellous, for they are a people very obedient to their chiefs. Further, they call the corps of 100,000 men a Tuc; that of 10,000 they call a Toman; the thousand they call...; the hundred Guz; the ten.... And when the army is on the march they have always 200 horsemen, very well mounted, who are sent a distance of two marches in advance to reconnoitre, and these always keep ahead. They have a similar party detached in the rear, and on either flank, so that there is a good look-out kept on all sides against a surprise. When they are going on a distant expedition they take no gear with them except two leather bottles for milk; a little earthenware pot to cook their meat in, and a little tent to shelter them from rain. And in case of great urgency they will ride ten days on end without lighting a fire or taking a meal. On such an occasion they will sustain themselves on the blood of their horses, opening a vein and letting the blood jet into their mouths, drinking till they have had enough, and then staunching it.
When they come to an engagement with the enemy, they will gain victory in this fashion. [They never let themselves get into a regular medley, but keep perpetually riding round and shooting into the enemy. And] as they do not count it any shame to run away in battle, they will [sometimes pretend to] do so, and in running away they turn in the saddle and shoot hard and strong at the foe, and in this way make great havoc. Their horses are trained so perfectly that they will double hither and thither, just like a dog, in a way that is quite astonishing. 
Thus it is that the Mongols have connected the world, and through their conquest, grade trade has come up in all the lands that they control. No merchant fears to travel so long as they pay tax to the Mongols.
 
 
 
Of the Merchant Ships of Manzi that Sail Upon the Indian Seas
Having finished our discourse concerning those countries wherewith our Book hath been occupied thus far, we are now about to enter on the subject of INDIA, and to tell you of all the wonders thereof.
And first let us speak of the ships in which merchants go to and fro amongst the Isles of India.
These ships, you must know, are of fir timber. They have but one deck, though each of them contains some 50 or 60 cabins, wherein the merchants abide greatly at their ease, every man having one to himself. The ship hath but one rudder, but it hath four masts; and sometimes they have two additional masts, which they ship and unship at pleasure.
The fastenings are all of good iron nails and the sides are double, one plank laid over the other, and caulked outside and in. The planks are not pitched, for those people do not have any pitch, but they daub the sides with another matter, deemed by them far better than pitch; it is this. You see they take some lime and some chopped hemp, and these they knead together with a certain wood-oil; and when the three are thoroughly amalgamated, they hold like any glue. And with this mixture they do paint their ships. 
Each of their great ships requires at least 200 mariners [some of them 300]. They are indeed of great size, for one ship shall carry 5000 or 6000 baskets of pepper [and they used formerly to be larger than they are now]. And aboard these ships, you must know, when there is no wind they use oars so large that it takes four men to operate them. But when there is wind, for they catch the great Monsoon winds which occur each season, they use a triangular lateen sail. This allows them to move the ships more easily than a square rig, for the lateen sail’s triangle can catch the wind at every angle.
When the ship has been a year in work and they wish to repair her, they nail on a third plank over the first two, and caulk and pay it well; and when another repair is wanted they nail on yet another plank, and so on year by year as it is required. Howbeit, they do this only for a certain number of years, and till there are six thicknesses of planking. When a ship has come to have six planks on her sides, one over the other, they take her no more on the high seas, but make use of her for coasting as long as she will last, and then they break her up.[6]
Now that I have told you about the ships which sail upon the Ocean Sea and among the Isles of India, let us proceed to speak of the various wonders of India; but first and foremost I must tell you about a number of Islands that there are in that part of the Ocean Sea where we now are, I mean the Islands lying to the eastward. So let us begin with an Island which is called Java.
Concerning the Great Island of Java
When you sail from Champa, famous for its fast-growing rice, 1500 miles in a course between south and south-east, you come to a great Island called Java. And the experienced mariners of those Islands who know the matter well, say that it is the greatest Island in the world, and has a compass of more than 3000 miles. It is subject to a great King and tributary to no one else in the world. The people are Idolaters. The Island is of surpassing wealth, producing black pepper, nutmegs, spikenard, galingale, cubebs, cloves, and all other kinds of spices.
This Island is also frequented by a vast amount of shipping, and by merchants who buy and sell costly goods from which they reap great profit. Indeed the treasure of this Island is so great as to be past telling. And I can assure you the Great Khan never could get possession of this Island, on account of its great distance, and the great expense of an expedition thither. The merchants of Zayton and Manzi draw annually great returns from this country.
Concerning the Kingdom of Malabar Coast
Malabar Coast is a great kingdom lying towards the west. The people are Idolaters; they have a language of their own, and a king of their own, and pay tribute to nobody.
In this country you see more of the North Star, for it shows two cubits above the water. And you must know that from this kingdom of Malabar Coast, and from another near it called Gujarat, there go forth every year more than a hundred corsair vessels on cruise. These pirates take with them their wives and children, and stay out the whole summer. Their method is to join in fleets of 20 or 30 of these pirate vessels together, and then they form what they call a sea cordon, that is, they drop off till there is an interval of 5 or 6 miles between ship and ship, so that they cover something like an hundred miles of sea, and no merchant ship can escape them. Thus, just as the merchants use the Monsoon winds, so too do the pirates. But now the merchants are aware of this, and go so well manned and armed, and with such great ships, that they don't fear the corsairs. Still mishaps do befall them at times
There is in this kingdom a great quantity of pepper, and ginger, and cinnamon, and turbit, and of nuts of India. They also manufacture very delicate and beautiful buckrams. The ships that come from the east bring copper in bulk. They also bring hither cloths of silk and gold, and sandals; also gold and silver, cloves and spikenard, and other fine spices for which there is a demand here, and exchange them for the products of these countries.
Ships come hither from many quarters, but especially from the great province of Manzi. Coarse spices are exported hence both to Manzi and to the west, and that which is carried by the merchants to Aden goes on to Alexandria, but the ships that go in the latter direction are not one to ten of those that go to the eastward; a very notable fact that I have mentioned before.
Now I have told you about the kingdom of Malabar Coast; we shall now proceed and tell you of the kingdom of Gujarat. And you must understand that in speaking of these kingdoms we note only the capitals; there are great numbers of other cities and towns of which we shall say nothing, because it would make too long a story to speak of all.
 
Concerning the Kingdom of Gujarat
Gujarat is a great kingdom. The people are Idolaters and have a peculiar language, and a king of their own, and are tributary to no one. It lies towards the west, and the North Star is here still more conspicuous, showing itself at an altitude of about 6 cubits.
The people are the most desperate pirates in existence, and one of their atrocious practices is this. When they have taken a merchant-vessel they force the merchants to swallow a stuff called Tamarindi mixed in sea-water, which produces a violent purging.This is done in case the merchants, on seeing their danger, should have swallowed their most valuable stones and pearls. And in this way the pirates secure the whole.
In this province of Gujarat there grows much pepper, and ginger, and indigo. They also have a great deal of cotton. Their cotton trees are of very great size, growing full six paces high, and attaining to an age of 20 years. It is to be observed however that, when the trees are so old as that, the cotton is not good to spin, but only to quilt or stuff beds with. Up to the age of 12 years indeed the trees give good spinning cotton, but from that age to 20 years the produce is inferior.
They dress in this country great numbers of skins of various kinds, goat-skins, ox-skins, buffalo and wild ox-skins, as well as those of unicorns and other animals. In fact so many are dressed every year as to load a number of ships for Arabia and other quarters. They also work here beautiful mats in red and blue leather, exquisitely inlaid with figures of birds and beasts, and skilfully embroidered with gold and silver wire. These are marvellously beautiful things; they are used by the Saracens to sleep upon, and capital they are for that purpose. They also work cushions embroidered with gold, so fine that they are worth six marks of silver a piece, whilst some of those sleeping-mats are worth ten marks.
 
Concerning the Island of Madagascar
Madagascar is an Island towards the south, about a thousand miles from Scotra. The people are all Saracens, adoring Mahommet. They have four Esheks, i.e. four Elders, who are said to govern the whole Island. And you must know that it is a most noble and beautiful Island, and one of the greatest in the world, for it is about 4000 miles in compass. The people live by trade and handicrafts.
In this Island, and in another beyond it called Zanzibar, about which we shall tell you afterwards, there are more elephants than in any country in the world. The amount of traffic in elephants' teeth in these two Islands is something astonishing.
In this Island they eat no flesh but that of camels; and of these they kill an incredible number daily. They say it is the best and wholesomest of all flesh; and so they eat of it all the year round.
They have in this Island many trees of red sanders, of excellent quality; in fact, all their forests consist of it. They have also a quantity of ambergris, for whales are abundant in that sea, and they catch numbers of them; and so are Oil-heads, which are a huge kind of fish, which also produce ambergris like the whale. There are numbers of leopards, bears, and lions in the country, and other wild beasts in abundance. Many traders, and many ships go thither with cloths of gold and silk, and many other kinds of goods, and drive a profitable trade.
You must know that this Island lies so far south that ships cannot go further south or visit other Islands in that direction, except this one, and that other of which we have to tell you, called Zanzibar. This is because the sea-current runs so strong towards the south that the ships which should attempt it never would get back again. Indeed, the ships of Maabar which visit this Island of Madagascar, and that other of Zanzibar, arrive thither with marvellous speed, for great as the distance is they accomplish in 20 days, whilst the return voyage takes them more than 3 months. This (I say) is because of the strong current running south, which continues with such singular force and in the same direction at all seasons. It is my belief that without the great Monsoon winds, they cannot travel farther south.
'Tis said that in those other Islands to the south, which the ships are unable to visit because this strong current prevents their return, is found the bird Gryphon, which appears there at certain seasons. The description given of it is however entirely different from what our stories and pictures make it. For persons who had been there and had seen it told Messer Marco Polo that it was for all the world like an eagle, but one indeed of enormous size; so big in fact that its wings covered an extent of 30 paces, and its quills were 12 paces long, and thick in proportion. And it is so strong that it will seize an elephant in its talons and carry him high into the air, and drop him so that he is smashed to pieces; having so killed him the bird gryphon swoops down on him and eats him at leisure. The people of those isles call the bird Ruc, and it has no other name. So I wot not if this be the real gryphon, or if there be another manner of bird as great. But this I can tell you for certain, that they are not half lion and half bird as our stories do relate; but enormous as they be they are fashioned just like an eagle.
`.trim(), 'sentence');

export function AutoNote(props) {
  const [selectedPar, setSelectedPar] = useState(0);
  const [finished, setFinished] = useState(false);
  const [noteDocument, setNoteDocument] = useState(emptyValue);
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

    // Add the new notes to the document
    if (value !== emptyValue) {
      const newDocument = insertElement(
        value,
        noteDocument,
        form.elements.sectionTitle.value,
      );
      setNoteDocument(newDocument);
    };

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