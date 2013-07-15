<?php
namespace RubyGarage\Bundle\RestBundle\Controller;
use Symfony\Component\HttpFoundation\Request,
    Symfony\Component\HttpFoundation\Response,
    Symfony\Bundle\FrameworkBundle\Controller\Controller;

use FOS\RestBundle\View\RouteRedirectView,
    FOS\RestBundle\View\View,
    FOS\RestBundle\Controller\Annotations\QueryParam,
    FOS\RestBundle\Request\ParamFetcher,
    FOS\RestBundle\Request\ParamFetcherInterface,
    FOS\RestBundle\Controller\Annotations\RequestParam;

use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use RubyGarage\Bundle\ProjectBundle\Entity\Project;
use RubyGarage\Bundle\ProjectBundle\Form\ProjectType;

class ProjectsController extends Controller
{
    /**
     * Get certain project
     * @param integer $project_id any valid project id
     * @ApiDoc(
     *  resource=true,
     *  description="Get project by ID",
     *  statusCodes={
     *         200="Returned when successful",
     *         400="Returned when the project id is not valid",
     *         404="Returned when the project was not found"
     *     }
     * )
     *
     */

    public function getProjectAction($project_id)
    {
        $em = $this->getDoctrine()->getManager();
        if (!is_numeric($project_id)) {
            throw new HttpException(400, "Truck id is not valid.");
        }
        $entity = $em->getRepository('RubyGarageProjectBundle:Project')->find($project_id);
        if (!$entity) {
            throw $this->createNotFoundException('Project was not found');
        }
        return $this->makeResponse($entity);
    }

    /**
     * Get the list of projects
     *
     * @param ParamFetcher $paramFetcher
     * @ApiDoc()
     */
    public function getProjectsAction()
    {
        $em = $this->getDoctrine()->getManager();
        $projects = $em->getRepository('RubyGarageProjectBundle:Project')->findAll();
        return $this->makeResponse($projects);
    }

    private function makeResponse($data, $statusCode = 200)
    {
        $view = View::create()->setStatusCode($statusCode);
        $view->setData($data);
        return $this->get('fos_rest.view_handler')->handle($view);
    }

    /**
     *
     * Creates a new project
     * @RequestParam(name="name", requirements="[a-z]+", description="name of project")
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Creates new project.",
     *  statusCodes={
     *         201="Returned when successfully saved",
     *         400="Returned when the project data is not valid",
     *     }
     * )
     *
     */

    public function postProjectsAction()

    {
        return $this->processForm();

    }
    /**
     *
     * Creates a new project
     * @RequestParam(name="name", requirements="[a-z]+", description="name of project")
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Updates a project.",
     *  statusCodes={
     *         204="Returned when successfully saved",
     *         400="Returned when the project data is not valid",
     *     }
     * )
     *
     */

    public function putProjectsAction($project_id)

    {
        $em = $this->getDoctrine()->getManager();
        $project = $em->getRepository('RubyGarageProjectBundle:Project')->find($project_id);
        return $this->processForm($project);

    }


    /**
     * this function is responsible for creating and updating projects
     * @param \RubyGarage\Bundle\ProjectBundle\Entity\Dossier $dossier
     * @return \FOS\RestBundle\View\View|\Symfony\Component\HttpFoundation\Response
     */

    private function processForm(Project $project = null)
    {
        if ($project === null) {
            $project = new Project();
        }
        $form = $this->createForm(new ProjectType(), $project);
        $form->submit($this->getRequest());
        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($project);
            $em->flush();
            $response = new Response();
            $statusCode = $project->getId() ? 201 : 204;
            $response->setStatusCode($statusCode);
            // set the `Location` header only when creating new resources
            $response->headers->set('Location',
                $this->generateUrl(
                    'get_project', array('project_id' => $project->getId()),
                    true // absolute
                )
            );
            return $response;
        }
        return $this->makeResponse($form, 400);
    }

    /**
     * delete certain project
     * @param integer $project_id any valid project id
     * @ApiDoc(
     *  resource=true,
     *  description="delete project by ID",
     *  statusCodes={
     *         200="Returned when successful",
     *         400="Returned when the project id is not valid",
     *         404="Returned when the project was not found"
     *     }
     * )
     *
     */
    public function deleteProjectsAction($project_id)
    {
        $em = $this->getDoctrine()->getManager();
        $response = new Response();

        $project = $em->getRepository('RubyGarageProjectBundle:Project')->find($project_id);
        if(!$project){
            throw $this->createNotFoundException('Project was not found');
        }
        $em->remove($project);
        $em->flush();
        $response->setStatusCode(204);
        return $response;

    }
}