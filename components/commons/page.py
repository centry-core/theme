from flask import request, render_template, render_template_string
from ....backend_performance.connectors.influx import get_sampler_types
from ....backend_performance.models.api_reports import APIReport
from ....shared.connectors.auth import SessionProject


def render_page(context, slot, payload):  # pylint: disable=R0201,W0613
    """ Base template slot """
    chapter = str(request.args.get('chapter', '')).lower()
    module = str(request.args.get('module', '')).lower()
    page = str(request.args.get('page', '')).lower()
    # scripts = context.rpc_manager.call_function_with_timeout(
    #                 func=self.rpc_func,
    #                 timeout=5,
    #                 **self.rpc_kwargs
    #             )
    from queue import Empty
    try:
        payload['scripts'] = context.rpc_manager.call_function_with_timeout(
            func='page_scripts',
            timeout=5
        )
    except Empty:
        payload['scripts'] = ''
    try:
        if page:
            return render_template(f"theme:{chapter}/{module}/{page}.html",
                                   active_chapter=chapter,
                                   config=payload)
        return render_template(f"theme:{chapter}/{module}.html", active_chapter=chapter, config=payload)
    except:
        return render_template(f"theme:common/empty.html", active_chapter=chapter, config=payload)


def render_test(context, slot, payload):  # pylint: disable=R0201,W0613
    """ Base template slot """
    chapter = request.args.get('chapter', '')
    module = request.args.get('module', '')
    try:
        if module:
            return render_template(f"theme:{chapter.lower()}/{module.lower()}/create.html", active_chapter=chapter,
                                   config=payload)
        return render_template(f"theme:{chapter.lower()}/create.html", active_chapter=chapter, config=payload)
    except:
        return render_template(f"theme:common/empty.html", active_chapter=chapter, config=payload)


def render_run_test(context, slot, payload):  # pylint: disable=R0201,W0613
    """ Base template slot """
    chapter = request.args.get('chapter', '')
    module = request.args.get('module', '')
    try:
        if module:
            return render_template(f"theme:{chapter.lower()}/{module.lower()}/runtest.html", active_chapter=chapter,
                                   config=payload)
        return render_template(f"theme:{chapter.lower()}/runtest.html", active_chapter=chapter, config=payload)
    except:
        return render_template(f"theme:common/empty.html", active_chapter=chapter, config=payload)


def thresholds(context, slot, payload):
    chapter = request.args.get('chapter', '')
    module = request.args.get('module', '')
    tests = APIReport.query.filter(APIReport.project_id == SessionProject.get()).with_entities(APIReport.name).distinct()
    tests = [each[0] for each in tests]
    payload['tests'] = tests
    return render_template(f"theme:{chapter.lower()}/{module.lower()}/thresholds.html", active_chapter=chapter,
                           config=payload)


def reporting_config(context, slot, payload):
    return render_template(f"theme:common/reporting-config.html", config=payload)


def params_table(context, slot, payload):
    return render_template(f"theme:common/params_table.html", config=payload)


def locations(context, slot, payload):
    return render_template(f"theme:common/locations.html", config=payload)


def source_card(context, slot, payload):
    return render_template(f"theme:common/source_card.html", config=payload)


def test_result_page(context, slot, payload):
    chapter = request.args.get('chapter', '')
    module = request.args.get('module', '')
    if chapter.lower() == "security":
        test_data = context.rpc_manager.timeout(5).security_results_or_404(request.args.get('result_test_id'))
    if chapter.lower() == "performance":
        test_data = context.rpc_manager.timeout(5).backend_results_or_404(request.args.get('result_test_id')).to_json()
        try:
            test_data["failure_rate"] = round((test_data["failures"] / test_data["total"]) * 100, 2)
        except:
            test_data["failure_rate"] = 0
        # TODO set tags in model
        test_data["tags"] = []
        test_data["samplers"] = get_sampler_types(test_data["project_id"], test_data["build_id"], test_data["name"],
                                                  test_data["lg_type"])
    try:
        payload['test_data'] = test_data
        return render_template(f"theme:{chapter.lower()}/{module.lower()}/test_running_result.html",
                               active_chapter=chapter,
                               config=payload)
    except:
        return render_template(f"theme:common/empty.html", active_chapter=chapter, config=payload)


def render_alert_bar(context, slot, payload):
    return render_template('theme:common/alert_bar.html', config=payload)


def security_results_show_config(context, slot, payload):
    return render_template('theme:security/result/show_config.html', config=payload)


# def page_scripts(context, slot, payload):
#     from pylon.core.tools import log
#     log.info('SLOT')
#     log.info(slot)
#     log.info('payload')
#     log.info(payload)
#     context.rpc_manager.register_function(
#         lambda: payload,
#         name='page_scripts'
#     )
#     return ''
