import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { UserCustomization } from './customization';

export function NavbarPopup(props) {
  const {showUpdateModal, firstName} = props;
  const [isOpen, setIsOpen] = useState(showUpdateModal);
  const closeModal = () => {
    setIsOpen(false);
    // TODO: log the modal was closed and how long the user spent reading the modal
  }

  if (!showUpdateModal) return null;
  return (
    <Modal show={isOpen} onHide={closeModal} size='lg'>
      <Modal.Header>
        <Modal.Title>{firstName ? `Welcome Back, ${firstName}!` : 'New Changes'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h1>Duo Reges: constructio interrete.</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quoniam, si dis placet, ab Epicuro loqui discimus. Eaedem res maneant alio modo. Nos cum te, M. Si longus, levis. Id Sextilius factum negabat. </p>

        <ul>
          <li>Tum ille: Tu autem cum ipse tantum librorum habeas, quos hic tandem requiris?</li>
          <li>Sin eam, quam Hieronymus, ne fecisset idem, ut voluptatem illam Aristippi in prima commendatione poneret.</li>
          <li>Quasi vero, inquit, perpetua oratio rhetorum solum, non etiam philosophorum sit.</li>
          <li>Nam, ut sint illa vendibiliora, haec uberiora certe sunt.</li>
        </ul>


        <ol>
          <li>Mihi enim satis est, ipsis non satis.</li>
          <li>Itaque e contrario moderati aequabilesque habitus, affectiones ususque corporis apti esse ad naturam videntur.</li>
          <li>Putabam equidem satis, inquit, me dixisse.</li>
          <li>Quid, si non sensus modo ei sit datus, verum etiam animus hominis?</li>
          <li>Quis enim redargueret?</li>
          <li>At ille pellit, qui permulcet sensum voluptate.</li>
        </ol>


        <pre>Quid, si etiam bestiae multa faciunt duce sua quaeque natura
        partim indulgenter vel cum labore, ut in gignendo, in
        educando, perfacile appareat aliud quiddam iis propositum,
        non voluptatem?

        Si enim non fuit eorum iudicii, nihilo magis hoc non addito
        illud est iudicatum-.
        </pre>


        <blockquote cite="http://loripsum.net">
          At ille non pertimuit saneque fidenter: Istis quidem ipsis verbis, inquit;
        </blockquote>


        <dl>
          <dt><dfn>Paria sunt igitur.</dfn></dt>
          <dd>Tum ego: Non mehercule, inquam, soleo temere contra Stoicos, non quo illis admodum assentiar, sed pudore impedior;</dd>
          <dt><dfn>Facete M.</dfn></dt>
          <dd>Terram, mihi crede, ea lanx et maria deprimet.</dd>
          <dt><dfn>Si longus, levis;</dfn></dt>
          <dd>Quid in isto egregio tuo officio et tanta fide-sic enim existimo-ad corpus refers?</dd>
          <dt><dfn>Quid Zeno?</dfn></dt>
          <dd>Varietates autem iniurasque fortunae facile veteres philosophorum praeceptis instituta vita superabat.</dd>
        </dl>
        <UserCustomization />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={closeModal} block>Got it!</Button>
      </Modal.Footer>
    </Modal>
  );
}