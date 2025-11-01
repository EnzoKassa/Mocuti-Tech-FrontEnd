import React, { useState, useEffect } from "react";
import { BiLike, BiSolidLike, BiDislike, BiSolidDislike } from "react-icons/bi";
import "../../styles/ModalFeedback.css";
import Swal from "sweetalert2";

const ModalFeedback = ({ modalData, onClose, onSave }) => {
  const [comentario, setComentario] = useState("");

  // Inicializa o estado quando o modal abre
  useEffect(() => {
    if (modalData) {
      setComentario(modalData.comentario || "");
    }
    // só inicializa ao abrir, não depende de mudanças de modalData
  }, []);

  return (
    <div className="feedback-modal-overlay">
      <div className="feedback-modal">
        <button className="feedback-modal-close" onClick={onClose}>
          ×
        </button>
        <h2>Descrição do Feedback</h2>

        <label>Comentário</label>
        <div className="feedback-modal-content">
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
          />
          <button
            onClick={() => {
              onSave({ ...modalData, comentario });
              Swal.fire({
                title: "Comentário salvo com sucesso!",
                icon: "success",
                draggable: false, // Permite arrastar a janela
                showConfirmButton: false,
                timer: 1500,
                // confirmButtonColor: "#4FBD34",
                customClass: {
                  title: "swal-title",
                  htmlContainer: "swal-text",
                },
              });
            }}
          >
            Salvar Comentário
          </button>
        </div>

        <div className="feedback-modal-botoes">
          <p>Gostou do evento?</p>
          <div className="feedback-modal-actions">
            <button
              className={`nota-button ${
                modalData.nota === "like" ? "nota-ativo" : "nota-neutra"
              }`}
              onClick={() =>
                onSave({
                  ...modalData,
                  nota: modalData.nota === "like" ? null : "like",
                })
              }
            >
              {modalData.nota === "like" ? <BiSolidLike /> : <BiLike />}
              <span>Gostei</span>
            </button>
            <button
              className={`nota-button ${
                modalData.nota === "dislike" ? "nota-ativo" : "nota-neutra"
              }`}
              onClick={() =>
                onSave({
                  ...modalData,
                  nota: modalData.nota === "dislike" ? null : "dislike",
                })
              }
            >
              {modalData.nota === "dislike" ? (
                <BiSolidDislike />
              ) : (
                <BiDislike />
              )}
              <span>Não Gostei</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalFeedback;


