<?php

namespace  SculpinTools;

use Couchbase\DocumentFragment;
use Masterminds\HTML5;
use Sculpin\Core\Event\ConvertEvent;
use Sculpin\Core\Sculpin;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

final class AddLinksToId implements EventSubscriberInterface {

    const ELEMENTS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

    /**
     * Returns an array of event names this subscriber wants to listen to.
     *
     * The array keys are event names and the value can be:
     *
     *  * The method name to call (priority defaults to 0)
     *  * An array composed of the method name to call and the priority
     *  * An array of arrays composed of the method names to call and respective
     *    priorities, or 0 if unset
     *
     * For instance:
     *
     *  * array('eventName' => 'methodName')
     *  * array('eventName' => array('methodName', $priority))
     *  * array('eventName' => array(array('methodName1', $priority), array('methodName2')))
     *
     * @return array The event names to listen to
     */
    public static function getSubscribedEvents()
    {
        return [
            Sculpin::EVENT_AFTER_CONVERT => ['addLinksToIdTags']
        ];
    }

    /**
     * Adds a <a href="#id"> link to all h* elements with an id
     *
     * @param ConvertEvent $event
     */
    public function addLinksToIdTags(ConvertEvent $event) {

        // only do it on markdown
        if ($event->converter() != 'markdown') {
            return;
        }
        $content = $event->source()->content();

        if ( !empty($content)) {
            $html5 = new HTML5();
            $dom = $html5->loadHTML($content);
            $xpath = new \DOMXPath($dom);
            // search for all elements with an id attribute
            foreach ($xpath->query("//*[@id]") as $node) {
                /** @var \DOMElement $node */
                if (!in_array($node->nodeName, self::ELEMENTS)) {
                    continue;
                }
                    /** @var \DOMElement $node */
                // create the link element
                $a = new \DOMElement("a");
                // get all existing children of the node
                $childNodes = $node->childNodes;
                // append it to the node
                $node->appendChild($a);
                $a->setAttribute("href", "#" . $node->getAttribute("id"));
                $a->setAttribute("class", "anchorLink");
                // append all existing children to the new a node
                foreach($childNodes as $childNode) {
                    $a->appendChild($childNode);
                }

            }
            $html = "";
            // don't save the root node (which is html), but only the child nodes of it
            foreach ($dom->documentElement->childNodes as $node) {
                $html .= $html5->saveHTML($node);
            }
            $event->source()->setContent($html);
        }
    }
}
