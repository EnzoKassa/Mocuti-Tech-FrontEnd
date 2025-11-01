import React from "react";
import { BiLike, BiSolidLike, BiDislike, BiSolidDislike } from "react-icons/bi";
import "../../styles/ModalVisualizacao.css";

const ModalVisualizacao = ({ modalData, onClose }) => (
  <div className="feedback-modal-overlay">
    <div className="feedback-modal">
      <button className="feedback-modal-close" onClick={onClose}>
        ×
      </button>
      <h2>Detalhes do Evento</h2>

      <label>Comentário</label>
      <div className="feedback-modal-content">
        <textarea value={modalData.comentario || ""} readOnly />
      </div>

      <div className="feedback-modal-botoes">
        <p>Nota do Evento</p>
        <div className="feedback-modal-actions">
          <button className="nota-button" disabled>
            {modalData.nota === "like" ? <BiSolidLike /> : <BiLike />}
            <span>Gostei</span>
          </button>
          <button className="nota-button" disabled>
            {modalData.nota === "dislike" ? <BiSolidDislike /> : <BiDislike />}
            <span>Não Gostei</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default ModalVisualizacao;


