import { NavLateral } from "../../components/NavLateral";
import '../../styles/TelaComNavLateral.css';
import '../../styles/Feedbacks_M1.css';

function Feedbacks_M1() {
  return (
    <>
      <div className="TelaComNavLateral">

        <NavLateral />

        <div className="MainContent">

          <div className="boxTopFeedback">

            <div className="tituloFeedback">Feedback Dashboard </div>

            <div className="boxDashboardFeedback">

              <div className="dashPalestra">

              </div>

              <div className="dashQuantidadeFeedback">

              </div>

            </div>

          </div>


          <div className="boxLowFeedback">


            <div className="tituloFeedback"> Lista de Feedbacks </div>


            <div className="boxListaFeedback">


              <div className="colunas">



                <div className="colunaFeedback">

                </div>



                <div className="colunaNome">



                </div>


                <div className="colunaEmail">



                </div>



              </div>


              <div className="linhas">



                <div className="colunaFeedback">

                </div>



                <div className="colunaNome">



                </div>


                <div className="colunaEmail">



                </div>

                <div className="boxBotaoFeedback">

                  <button className="botaoMaisInfoFeedback"> Mais Informações </button>

                </div>

              </div>



            </div>


          </div>


        </div>
      </div>
    </>
  );
}

export default Feedbacks_M1;
