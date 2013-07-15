<?php
namespace RubyGarage\Bundle\UserBundle\Handler;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Bundle\FrameworkBundle\Routing\Router;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Authentication\AuthenticationSuccessHandlerInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationFailureHandlerInterface;

class AuthenticationHandler
    implements AuthenticationSuccessHandlerInterface,
    AuthenticationFailureHandlerInterface
{
    private $router;

    public function __construct(Router $router)
    {
        $this->router = $router;
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token)
    {
        if ($request->isXmlHttpRequest()) {
            $response = new Response();
            $response->setContent(
                json_encode(
                    array(
                        'status' => 'ok', 'error' => '', 'username' => $token->getUser()->getUsername()
                    )
                )
            );
            return $response;
        } else {
// If the user tried to access a protected resource and was forces to login
// redirect him back to that resource
            if ($targetPath = $request->getSession()->get('_security.target_path')) {
                $url = $targetPath;
            } else {
// Otherwise, redirect him to wherever you want
                $url = $this->router->generate('user_view', array(
                    'nickname' => $token->getUser()->getNickname()
                ));
            }

            return new RedirectResponse($url);
        }
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception)
    {
        if ($request->isXmlHttpRequest()) {
            $response = new Response();
            $response->setContent(json_encode(array(
                'last_login' => $request->get('_username'),
                'error' => $exception->getMessage()
            )));
            return $response;
        } else {
// Create a flash message with the authentication error message
            $request->getSession()->setFlash('error', $exception->getMessage());
            $url = $this->router->generate('user_login');

            return new RedirectResponse($url);
        }
    }
}