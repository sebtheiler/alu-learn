import React, { useState, useMemo } from 'react';
import {Button, Form} from 'react-bootstrap';
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
      const splitByPar = text.split('\n').filter(par => par && par.length > 1);
      const numSentences = 3;
      let finalText = [];

      for (const par of splitByPar) {
        // If there is no period, we assume it is a header
        if (par.includes('.') === false) {
          console.log(par)
          finalText.push(`<h1>${par}</h1>`);
        } else {
          const splitPar = par.split(/\.\s/gm);
          if (splitPar.length > numSentences) {
            const numConcatSentences = Math.ceil(splitPar.length / numSentences);
            for (let i = 0; i < numConcatSentences; i++) {
              const toPush = splitPar.slice(i*numConcatSentences, (i+1)*numConcatSentences).join('. ');
              console.log(toPush)
              finalText.push(toPush);
            };
          } else {
            console.log(par)
            finalText.push(par);
          };
        };
      };

      return finalText;
      // const splitText = text.split(/(\.\s)|(\n)/gm); // split by '.' followed by whitespace or newline
      // const numSentences = 3; // maximum number of sentences to display at a time
      // let textArray = [];
      // let sentenceIndex = 0;

      // // console.log(splitText)

      // do {
      //   const sentenceGroup = splitText.slice(sentenceIndex, sentenceIndex + numSentences);
      //   // console.log(sentenceGroup)        

      //   // Get sentences from the sentence group, unless it has a newline in it
      //   let pair = [];
      //   let newlinePairIndex;
      //   for (const [i, sentence] of sentenceGroup.entries()) {
      //     // console.log(sentence, sentence.includes('\n'))
      //     if (!sentence || sentence.includes('\n') || sentence === '. ') {
      //       if (pair.length > 0) {
      //         newlinePairIndex = i;
      //         break;
      //       };
      //     } else {
      //       pair.push(sentence);
      //     };
      //   };

      //   // console.log(pair)

      //   // Merge the sentences together
      //   const mergedPair = pair.join('. ', '');
      //   if (mergedPair) {
      //     textArray.push(mergedPair + mergedPair.endsWith('.') ? '' : '.');
      //   };

      //   // Increase the sentence index by the number of sentences shown
      //   sentenceIndex += newlinePairIndex ? newlinePairIndex : numSentences;
      // } while (sentenceIndex < splitText.length * numSentences);

      // return textArray;
    default:
      return;
  };
};

const text = parseText(`
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
      {selectedPar !== text.lenth - 1 &&
        <p style={{ color: '#e0e0e0' }} dangerouslySetInnerHTML={{__html:
          `${text[selectedPar + 1] && text[selectedPar + 1].substr(0, 150)}...`
        }} />
      }
    </div>
    {!finished ? <>
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
      </> :
      <div className='my-5'>
        <h3 className='text-center'>Here are the notes you took for this paper:</h3>
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